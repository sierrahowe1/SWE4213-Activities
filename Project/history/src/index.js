const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DB_URL,
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
  const connection = await connectWithRetry(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("video.viewed", { durable: false });

  channel.consume("video.viewed", async (msg) => {
    if (msg === null) return;
    const { videoId } = JSON.parse(msg.content.toString());
    await pool.query(
      `INSERT INTO view_history (video_id, view_count)
       VALUES ($1, 1)
       ON CONFLICT (video_id)
       DO UPDATE SET view_count = view_history.view_count + 1`,
      [videoId]
    );
    console.log(`Recorded view for video ${videoId}`);
    channel.ack(msg);
  });

  console.log("Connected to RabbitMQ, consuming video.viewed queue");

  app.listen(port, () => {
    console.log(`History service listening on port ${port}`);
  });
}

main().catch(console.error);

// app.post("/videos/:id/viewed", async (req, res) => {
//   const videoId = parseInt(req.params.id);
//   await pool.query(
//     `INSERT INTO view_history (video_id, view_count)
//      VALUES ($1, 1)
//      ON CONFLICT (video_id)
//      DO UPDATE SET view_count = view_history.view_count + 1`,
//     [videoId]
//   );
//   res.json({ videoId, message: "View recorded" });
// });

app.get("/videos/:id/views", async (req, res) => {
  const videoId = parseInt(req.params.id);
  const result = await pool.query(
    "SELECT view_count FROM view_history WHERE video_id = $1",
    [videoId]
  );
  const views = result.rows.length > 0 ? result.rows[0].view_count : 0;
  res.json({ videoId, views });
});

