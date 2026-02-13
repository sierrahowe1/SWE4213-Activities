# Streaming Service

A minimal video streaming microservice built with Express.js and containerized with Docker.

## Solution

### 1. Build the Docker image

From the project root directory, build the image and tag it as `streaming-service`:

```bash
docker build -t streaming-service .
```

### 2. Run the container

Start a container from the image, mapping port 3000 on your machine to port 3000 in the container:

```bash
docker run -d -p 3000:3000 streaming-service
```

### 3. Access the endpoint

Open your browser and navigate to:

```
http://localhost:3000/video
```

You should see a sample MP4 video stream in your browser.

### 4. List running containers

View all running containers to find the container ID:

```bash
docker ps
```

### 5. View the container logs

Copy the container ID from the previous step and use it to inspect the logs:

```bash
docker logs <container-id>
```

You should see output like:

```
Microservice listening on port 3000, point your browser at http://localhost:3000/video
```

### 6. Stop and delete the container

Stop the running container and then remove it:

```bash
docker stop <container-id>
docker rm <container-id>
```