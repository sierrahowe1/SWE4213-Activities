const express = require("express");
const { Readable } = require("stream");

const app = express();
const port = process.env.PORT || 4000;

app.get("/videos", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Missing url query parameter");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch video");
    }

    res.setHeader("Content-Type", "video/mp4");
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error("Error fetching video:", err);
    res.status(500).send("Error fetching video");
  }
});

app.listen(port, () => {
  console.log(`Video storage service listening on port ${port}`);
});
