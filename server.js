import dotenv from 'dotenv';
dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// Order Schema
const orderSchema = new mongoose.Schema({
  user: Object,
  goal: String,
  questions: Object,
  paymentStatus: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Save order
app.post('/order', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ success: true, orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all orders (admin dashboard)
app.get('/admin/orders', async (req, res) => {
  const orders = await Order.find({});
  res.json(orders);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
