# Activity 2: Docker Compose — Multi-Service Architecture

## Overview

In this activity you will build a **gateway microservice** that communicates with an existing **catalog microservice**, then wire them together using Docker Compose.

**Architecture:**

```
Browser → Gateway (:4002) → Catalog (:4000)
```

- **Catalog** — Returns a JSON list of available videos. Already built for you.
- **Gateway** — The public-facing service that fetches data from the catalog and returns it to the client. You will build this.

### What you'll learn

- Writing a `Dockerfile` from scratch
- Adding services to `docker-compose.yml`
- Inter-container networking (services communicating via service names as hostnames)
- Using environment variables for service configuration

## Pre-requisites

- Docker Desktop installed and running
- A terminal / command line
- A text editor

---

## Part 1: Explore the Catalog Service

The catalog service is already provided. Start by getting it running and understanding what it does.

**1.1** Start the catalog service:

```bash
docker-compose up --build
```

**1.2** In another terminal, test the catalog endpoint:

```bash
curl http://localhost:4000/videos
```

You should see a JSON array of videos:

```json
[
  { "id": 1, "title": "The Art of Coding", "path": "/video?id=1" },
  { "id": 2, "title": "Microservices 101", "path": "/video?id=2" },
  { "id": 3, "title": "Docker Deep Dive", "path": "/video?id=3" }
]
```

**1.3** Stop the service with `Ctrl+C` before moving on.

Take a look at the following files to understand the structure:

- `catalog/src/index.js` — The Express server
- `catalog/Dockerfile` — How the image is built
- `catalog/package.json` — Node.js dependencies
- `docker-compose.yml` — Service definition

---

## Part 2: Create the Gateway Microservice

You will now create a gateway service that fetches data from the catalog and returns it to the client.

### 2.1 Create the project structure

```bash
mkdir -p gateway/src
```

### 2.2 Create `gateway/package.json`

Create the file `gateway/package.json` with the following contents:

```json
{
  "name": "gateway",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "description": "Gateway microservice",
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

### 2.3 Create `gateway/src/index.js`

Create the file `gateway/src/index.js`. The gateway needs to:

1. Read the catalog service URL from an environment variable called `CATALOG_URL`
2. Expose a `GET /videos` endpoint
3. When that endpoint is hit, fetch the video list from the catalog service and return it

Here is a skeleton — fill in the missing parts marked with `___`:

```js
const express = require("express");

const app = express();
const port = process.env.PORT || 4002;
const CATALOG_URL = process.env.CATALOG_URL;

app.get("/videos", async (req, res) => {
  try {
    const response = await fetch(`${___}/videos`);
    const videos = await response.json();
    res.json(___);
  } catch (error) {
    console.error("Failed to reach catalog service:", error.message);
    res.status(500).json({ error: "Catalog service unavailable" });
  }
});

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});
```

> **Hint:** The blanks should use the constant you defined above, and return the data you received.

### 2.4 Create `gateway/Dockerfile`

Write a Dockerfile for the gateway. It should follow the same pattern as the catalog's Dockerfile:

1. Use `node:18` as the base image
2. Set the working directory to `/usr/src/app`
3. Copy `package*.json` and install dependencies
4. Copy the `src/` directory
5. Set the start command

> **Hint:** Look at `catalog/Dockerfile` for reference. The gateway doesn't need a `videos/` directory.

### 2.5 Create `gateway/.dockerignore`

Create `gateway/.dockerignore` to exclude unnecessary files from the Docker build:

```
.git
.github
node_modules
```

---

## Part 3: Wire It Together in Docker Compose

Now add the gateway service to `docker-compose.yml`.

Open `docker-compose.yml` and replace the commented-out `gateway` section with a real service definition. You need to configure:

| Field | Value | Why |
|-------|-------|-----|
| `image` | `gateway` | Name for the built image |
| `build.context` | `./gateway` | Path to the gateway directory |
| `build.dockerfile` | `Dockerfile` | The Dockerfile to use |
| `container_name` | `gateway` | Name for the running container |
| `ports` | `"4002:4002"` | Expose port 4002 to the host |
| `environment.PORT` | `4002` | Tell the app which port to listen on |
| `environment.CATALOG_URL` | `http://catalog:4000` | URL to reach the catalog service |

### How Docker Compose Networking Works

When you define multiple services in `docker-compose.yml`, Docker Compose automatically creates a network and connects all services to it. Each service can reach the others **using the service name as a hostname**.

Since we named our first service `catalog`, the gateway can reach it at `http://catalog:4000` — Docker's built-in DNS resolves `catalog` to the catalog container's IP address automatically.

This is why we pass `CATALOG_URL=http://catalog:4000` as an environment variable: the gateway code reads this variable and uses it to make HTTP requests to the catalog.

---

## Part 4: Build and Run

**4.1** Build and start both services:

```bash
docker-compose up --build
```

You should see logs from both the `catalog` and `gateway` containers.

**4.2** Test the catalog directly:

```bash
curl http://localhost:4000/videos
```

**4.3** Test the gateway (which fetches from the catalog internally):

```bash
curl http://localhost:4002/videos
```

Both commands should return the same JSON list of videos. The gateway is fetching from the catalog service over Docker's internal network.

**4.4** Stop everything:

```bash
docker-compose down
```

---

## Verification Checklist

- [ ] `docker-compose up --build` starts both services without errors
- [ ] `curl http://localhost:4000/videos` returns the video list directly from the catalog
- [ ] `curl http://localhost:4002/videos` returns the same list via the gateway
- [ ] The gateway logs show it is connecting to the catalog service
- [ ] `docker-compose down` stops and removes all containers
