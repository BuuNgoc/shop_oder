const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/productModel");
const Order = require("./models/orderModel");
const User = require("./models/userModel");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      username: "admin",
      password: await User.hashPassword("admin123"),
      role: "admin"
    });
    const user = await User.create({
      username: "user",
      password: await User.hashPassword("user123"),
      role: "user"
    });

    const products = await Product.insertMany([
      {
        productName: "Wireless Mouse",
        category: "Electronics",
        stockStatus: "in_stock",
        unitPrice: 250000,
        tags: ["bestseller", "wireless", "accessory"]
      },
      {
        productName: "Mechanical Keyboard",
        category: "Electronics",
        stockStatus: "in_stock",
        unitPrice: 1200000,
        tags: ["gaming", "mechanical", "RGB"]
      },
      {
        productName: "USB-C Hub",
        category: "Electronics",
        stockStatus: "in_stock",
        unitPrice: 450000,
        tags: ["adapter", "USB-C", "portable"]
      },
      {
        productName: "Webcam HD",
        category: "Electronics",
        stockStatus: "out_of_stock",
        unitPrice: 800000,
        tags: ["streaming", "HD", "camera"]
      }
    ]);

    await Order.insertMany([
      {
        customerName: "Nguyen Thi Lan",
        productName: "Wireless Mouse",
        quantity: 2,
        orderDate: "2024-10-17T00:00:00Z",
        totalPrice: 500000,
        owner: user._id
      },
      {
        customerName: "Tran Van Minh",
        productName: "Mechanical Keyboard",
        quantity: 1,
        orderDate: "2024-10-18T00:00:00Z",
        totalPrice: 1200000,
        owner: admin._id
      }
    ]);

    console.log("Seed data successfully");
    process.exit();
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedData();
