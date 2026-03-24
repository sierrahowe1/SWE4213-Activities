const express = require("express");

const app = express();
const port = process.env.PORT || 4000;

const videos = [
  { id: 1, title: "The Art of Coding", path: "/video?id=1" },
  { id: 2, title: "Microservices 101", path: "/video?id=2" },
  { id: 3, title: "Docker Deep Dive", path: "/video?id=3" },
];

app.get("/videos", (req, res) => {
  res.json(videos);
});

app.listen(port, () => {
  console.log(`Catalog microservice listening on port ${port}`);
});
