# Video Streaming — Kubernetes Local Setup

## Architecture

```
Internet
   │
   ▼
[gateway]          ← LoadBalancer (port 3000) — rate limited: 100 req / 15 min
   │
   ▼
[video-streaming]  ← ClusterIP (internal only, 3 replicas)
   ├──────────────────────────────────────────┐
   ▼                                          ▼
[video-storage]    ← ClusterIP (2 replicas)  [history] ← ClusterIP (2 replicas)
                                               ▲
                                               │ (RabbitMQ consumer)
[rabbitmq]  ──────────────────────────────────┘
[postgres]
```

All services except `gateway` are ClusterIP (unreachable from outside the cluster).

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Kubernetes enabled
- kubectl (included with Docker Desktop)

> To enable Kubernetes: Docker Desktop → Settings → Kubernetes → Enable Kubernetes

---

## 1. Build Docker images

Docker Desktop shares its Docker daemon with Kubernetes, so images built locally are available to the cluster immediately.

```bash
docker build -t gateway:latest         ./gateway
docker build -t video-streaming:latest ./video-streaming
docker build -t video-storage:latest   ./video-storage
docker build -t history:latest         ./history
```

---

## 2. Apply Kubernetes manifests

Apply infrastructure first, then services:

```bash
# Secrets & config
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/configmap.yaml

# Infrastructure
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/rabbitmq.yaml

# Application services
kubectl apply -f kubernetes/video-storage.yaml
kubectl apply -f kubernetes/history.yaml
kubectl apply -f kubernetes/video-streaming.yaml
kubectl apply -f kubernetes/gateway.yaml
```

Or apply everything at once:

```bash
kubectl apply -f kubernetes/
```

---

## 3. Wait for pods to be ready

```bash
kubectl get pods --watch
```

All pods should reach `Running` status. `video-streaming` and `history` wait for RabbitMQ — this can take 30–60 seconds.

---

## 4. Access the gateway

Docker Desktop automatically assigns `localhost` as the external IP for `LoadBalancer` services. The gateway is available at:

```
http://localhost:3000
```

You can confirm the external IP with:

```bash
kubectl get service gateway
```

---

## 5. Test it

```bash
# Get video metadata (includes view count)
curl http://localhost:3000/videos/1

# Stream a video
curl http://localhost:3000/videos/1/stream --output video.mp4
```

---

## Teardown

```bash
kubectl delete -f kubernetes/
```

---

## Rebuilding after code changes

After editing a service, rebuild its image and restart the deployment:

```bash
# Example: rebuilding gateway
docker build -t gateway:latest ./gateway
kubectl rollout restart deployment/gateway
```