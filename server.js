import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

/* -----------------------------
   CONFIG
------------------------------ */
mongoose.set("bufferCommands", false);

const app = express();
app.use(cors());
app.use(express.json());

/* -----------------------------
   SCHEMA
------------------------------ */
const orderSchema = new mongoose.Schema({
  user: {
    type: Object,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  questions: {
    type: Object,
    required: true
  },

  // 🔑 Referral / marketer code
  referralCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

/* -----------------------------
   ROUTES
------------------------------ */

// Create order
app.post("/order", async (req, res) => {
  try {
    const { user, goal, questions, referralCode } = req.body;

    if (!user || !goal || !questions) {
      return res.status(400).json({
        success: false,
        error: "Missing required order data"
      });
    }

    const order = await Order.create({
      user,
      goal,
      questions,
      referralCode: referralCode || null
    });

    res.json({
      success: true,
      orderId: order._id
    });

  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({
      success: false,
      error: "Server error while saving order"
    });
  }
});

// Admin: get all orders
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch orders"
    });
  }
});

/* -----------------------------
   START SERVER (AFTER DB)
------------------------------ */
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

startServer();
