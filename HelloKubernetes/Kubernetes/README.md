# 4 - Hello Kubernetes

A minimal Hello World example that runs an Express app inside a Kubernetes Pod using `kubectl`.

## Structure

```
4 - HelloKubernetes/
├── app/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js        # Express app — GET / returns "Hello, Kubernetes!"
└── k8s/
    ├── pod.yaml            # Pod definition
    └── service.yaml        # NodePort Service — exposes the Pod on localhost:30080
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with **Kubernetes enabled**
  - Docker Desktop > Settings > Kubernetes > Enable Kubernetes
- `kubectl` (bundled with Docker Desktop)

## Steps

### 1. Build the Docker image

```bash
docker build -t hello-kubernetes:latest ./app
```

> **Important:** The pod uses `imagePullPolicy: Never`, so Kubernetes uses the locally built image instead of pulling from a registry. This works out of the box with Docker Desktop's built-in Kubernetes cluster.

### 2. Deploy the Pod and Service

```bash
kubectl apply -f k8s/
```

### 3. Check the Pod is running

```bash
kubectl get pods
kubectl get services
```

You should see `hello-kubernetes` with status `Running`.

### 4. Access the app

Open [http://localhost:30080](http://localhost:30080).

The Service routes traffic from port `30080` on the node (your machine) to port `3000` inside the Pod. Unlike `kubectl port-forward`, this stays up as long as the Service exists — no terminal tunnel required.

### 5. View logs

```bash
kubectl logs hello-kubernetes
```

### 6. Tear down

```bash
kubectl delete -f k8s/
```

## Key Concepts

| Concept | What it does |
|---|---|
| **Pod** | The smallest deployable unit in Kubernetes — wraps one or more containers |
| **Service** | Gives the Pod a stable network endpoint; `NodePort` exposes it on a port of the node |
| `selector: app: hello-kubernetes` | How the Service finds the Pod — matches the Pod's label |
| `imagePullPolicy: Never` | Tells Kubernetes to use a locally available image instead of pulling from Docker Hub |