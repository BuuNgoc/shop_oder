// Expose current user + flash message to every view
exports.setLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
};

exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    req.session.flash = { type: "error", message: "Please log in to continue." };
    return res.redirect("/login");
  }
  next();
};

exports.requireGuest = (req, res, next) => {
  if (req.session.user) return res.redirect("/orders");
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.session.user || !roles.includes(req.session.user.role)) {
    return res.status(403).render("error", {
      title: "Access denied",
      message: "You do not have permission to perform this action."
    });
  }
  next();
};
