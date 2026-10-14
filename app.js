const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");
const { setLocals } = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const isProd = process.env.NODE_ENV === "production";

// Behind Render's HTTPS proxy
if (isProd) app.set("trust proxy", 1);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Sessions (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 1000 * 60 * 60 * 8 }
  })
);
app.use(setLocals);

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", "./views");

// Routes
app.use("/", orderRoutes);

app.use((req, res) => {
  res.status(404).render("error", { title: "Not found", message: "Page not found." });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
