const User = require("../models/userModel");

exports.showLogin = (req, res) => {
  res.render("login", { title: "Sign in", error: null, username: "" });
};

exports.login = async (req, res) => {
  try {
    const username = (req.body.username || "").trim().toLowerCase();
    const password = req.body.password || "";

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render("login", {
        title: "Sign in",
        error: "Invalid username or password.",
        username
      });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).send(err.message);
      req.session.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      };
      req.session.flash = { type: "success", message: `Welcome back, ${user.username}!` };
      res.redirect("/orders");
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.showRegister = (req, res) => {
  res.render("register", { title: "Create account", error: null, username: "" });
};

exports.register = async (req, res) => {
  try {
    const username = (req.body.username || "").trim().toLowerCase();
    const { password, confirmPassword } = req.body;

    const fail = (error) =>
      res.status(400).render("register", { title: "Create account", error, username });

    if (username.length < 3) return fail("Username must be at least 3 characters.");
    if (!password || password.length < 6) return fail("Password must be at least 6 characters.");
    if (password !== confirmPassword) return fail("Passwords do not match.");
    if (await User.findOne({ username })) return fail("Username is already taken.");

    // Public registration always creates a regular user
    await User.create({
      username,
      password: await User.hashPassword(password),
      role: "user"
    });

    req.session.flash = { type: "success", message: "Account created. Please sign in." };
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};

// Admin only: list users
exports.listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render("users", { title: "Users", users });
};
