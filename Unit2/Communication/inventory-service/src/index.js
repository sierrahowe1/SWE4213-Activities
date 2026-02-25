const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// In-memory inventory
const inventory = [
  { id: 1, name: "Laptop", price: 999.99, stock: 10 },
  { id: 2, name: "Headphones", price: 79.99, stock: 25 },
  { id: 3, name: "Keyboard", price: 49.99, stock: 50 },
];

// GET /items — list all items with their current stock
app.get("/items", (req, res) => {
  res.json(inventory);
});

// GET /items/:id — get a single item
app.get("/items/:id", (req, res) => {
  const item = inventory.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

// PUT /items/:id/reserve — deduct stock when an order is placed
app.put("/items/:id/reserve", (req, res) => {
  const item = inventory.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });

  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive number" });
  }
  if (item.stock < quantity) {
    return res.status(400).json({ error: "Insufficient stock", available: item.stock });
  }

  item.stock -= quantity;
  res.json({ success: true, item, reserved: quantity });
});

async function connectWithRetry(url, retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await amqp.connect(url);
    } catch (err) {
      console.log(`RabbitMQ not ready, retrying (${i}/${retries})...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Could not connect to RabbitMQ after retries");
}

async function main() {
  const connection = await connectWithRetry(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue("order.placed", { durable: false });

  channel.consume("order.placed", (msg) => {
    if (msg !== null) {
      const order = JSON.parse(msg.content.toString());
      console.log(`New order received: ${JSON.stringify(order)}`);
      channel.ack(msg);
    }
  })

  app.listen(PORT, () => {
    console.log(`Inventory service running on port ${PORT}`);
  });
}

main().catch(console.error);
