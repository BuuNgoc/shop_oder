const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { requireLogin, requireGuest, requireRole } = require("../middleware/auth");

// Root
router.get("/", (req, res) => res.redirect("/orders"));

// Auth
router.get("/login", requireGuest, authController.showLogin);
router.post("/login", requireGuest, authController.login);
router.get("/register", requireGuest, authController.showRegister);
router.post("/register", requireGuest, authController.register);
router.post("/logout", requireLogin, authController.logout);

// Admin only
router.get("/admin/users", requireLogin, requireRole("admin"), authController.listUsers);

// Orders (login required; ownership checked in controller)
router.get("/orders", requireLogin, orderController.getAllOrders);
router.get("/create-order", requireLogin, orderController.showCreateOrderForm);
router.post("/create-order", requireLogin, orderController.createOrder);
router.get("/orders/:id/edit", requireLogin, orderController.showUpdateOrderForm);
router.post("/orders/:id/update", requireLogin, orderController.updateOrder);
router.post("/orders/:id/delete", requireLogin, orderController.deleteOrder);

module.exports = router;
