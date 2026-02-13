const express = require("express");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.get("/video", async (req, res) => {
  const videoPath = "videos/SampleVideo_1280x720_1mb.mp4";
  const stats = await fs.promises.stat(videoPath);

  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "video/mp4",
  });
  fs.createReadStream(videoPath).pipe(res);
});

app.listen(port, () => {
  console.log(`Microservice listening on port ${port}, point your browser at http://localhost:${port}/video`);
});