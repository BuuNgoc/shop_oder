const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const isAdmin = (user) => user && user.role === "admin";

// Admin can manage every order; a user only their own
const canManage = (user, order) =>
  isAdmin(user) || (order.owner && order.owner.toString() === user.id);

const forbidden = (res) =>
  res.status(403).render("error", {
    title: "Access denied",
    message: "You can only modify your own orders."
  });

const notFound = (res) =>
  res.status(404).render("error", { title: "Not found", message: "Order not found." });

const flash = (req, type, message) => {
  req.session.flash = { type, message };
};

exports.getAllOrders = async (req, res) => {
  try {
    const user = req.session.user;
    const filter = isAdmin(user) ? {} : { owner: user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.render("order", {
      title: "Orders",
      orders,
      canManage: (order) => canManage(user, order)
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.showCreateOrderForm = async (req, res) => {
  try {
    const products = await Product.find({ stockStatus: "in_stock" });

    res.render("createOrder", { title: "New order", products, error: null });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customerName, productName, quantity, orderDate } = req.body;

    const renderError = async (message) => {
      const products = await Product.find({ stockStatus: "in_stock" });
      return res.render("createOrder", { title: "New order", products, error: message });
    };

    if (!customerName || !productName || !quantity || !orderDate) {
      return renderError("Please fill in all required fields.");
    }

    const product = await Product.findOne({ productName: productName });

    if (!product) {
      return renderError("Product does not exist in the system.");
    }

    if (product.stockStatus !== "in_stock") {
      return renderError("Product is not available for ordering.");
    }

    const totalPrice = Number(quantity) * product.unitPrice;

    await Order.create({
      customerName,
      productName,
      quantity: Number(quantity),
      orderDate,
      totalPrice,
      owner: req.session.user.id
    });

    flash(req, "success", "Order created successfully.");
    res.redirect("/orders");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.showUpdateOrderForm = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return notFound(res);
    if (!canManage(req.session.user, order)) return forbidden(res);

    const products = await Product.find();

    res.render("updateOrder", { title: "Update order", order, products, error: null });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { customerName, productName, quantity, orderDate } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return notFound(res);
    if (!canManage(req.session.user, order)) return forbidden(res);

    const product = await Product.findOne({ productName: productName });

    if (!product) {
      const products = await Product.find();

      return res.render("updateOrder", {
        title: "Update order",
        order,
        products,
        error: "Product does not exist in the system."
      });
    }

    order.customerName = customerName;
    order.productName = productName;
    order.quantity = Number(quantity);
    order.orderDate = orderDate;
    order.totalPrice = Number(quantity) * product.unitPrice;

    await order.save();

    flash(req, "success", "Order updated successfully.");
    res.redirect("/orders");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return notFound(res);
    if (!canManage(req.session.user, order)) return forbidden(res);

    await Order.findByIdAndDelete(req.params.id);

    flash(req, "success", "Order deleted.");
    res.redirect("/orders");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
