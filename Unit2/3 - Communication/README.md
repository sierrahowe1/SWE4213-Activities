# Activity 3: Communication — HTTP & RabbitMQ Between Microservices

## Overview

In this activity you will connect two microservices using two different communication patterns:

- **HTTP (synchronous)** — the Order Service calls the Inventory Service directly to reserve stock before confirming an order.
- **RabbitMQ (asynchronous)** — once an order is confirmed, the Order Service publishes an event to a message queue, and the Inventory Service consumes it in the background.

```
                  HTTP PUT /items/:id/reserve (sync)
  Order Service ─────────────────────────────────► Inventory Service
  (port 3001)   ◄─────────────────────────────────  (port 3000)
       │
       │  "order.placed" message (async)
       └──────────────────► RabbitMQ ──────────────► Inventory Service
                           (port 5672)                  (consumer)
```

By the end you will have written the code that makes both patterns work, wired them together in Docker Compose, and understood *why* each pattern is used where it is.

---

## Part 1: Understand the Codebase

Before writing any code, read the two service files to understand what already exists and what you need to add.

### 1.1 `inventory-service/src/index.js`

This service is **fully built**. It exposes three HTTP endpoints:

| Method | Path | What it does |
|--------|------|--------------|
| `GET` | `/items` | Returns all items and their current stock levels |
| `GET` | `/items/:id` | Returns a single item |
| `PUT` | `/items/:id/reserve` | Deducts stock — returns an error if stock is too low |

### 1.2 `order-service/src/index.js`

This service is a **skeleton**. It has two endpoints stubbed out:

| Method | Path | What it does |
|--------|------|--------------|
| `POST` | `/orders` | Creates a new order — **you will complete this** |
| `GET` | `/orders` | Returns all confirmed orders |

Read through both files fully before moving on.

---

## Part 2: HTTP Communication

### Why HTTP here?

Reserving stock must happen **before** you confirm the order. If inventory is too low, the order should be rejected immediately — the customer needs to know right now, not eventually. That requires a synchronous call where you wait for a response before proceeding.

HTTP fits this perfectly: the order service calls the inventory service, waits for a success or error response, and only then decides whether to confirm the order.

### What to add

**File:** `order-service/src/index.js`

**Find:** The `// TODO (Part 2)` comment inside the `POST /orders` handler.

Try writing the fetch call yourself first. It should:
1. Send a `PUT` request to `${INVENTORY_URL}/items/${itemId}/reserve` with `{ quantity }` as the JSON body
2. If the response is not OK, read the error from the response body and throw it

<details>
<summary>Show solution</summary>

```js
const response = await fetch(`${INVENTORY_URL}/items/${itemId}/reserve`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ quantity }),
});

if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error || "Inventory reservation failed");
}
```

</details>

### What this does

- `INVENTORY_URL` comes from an environment variable. Inside Docker Compose it is set to `http://inventory-service:3000` — Docker's internal DNS resolves the service name `inventory-service` to the right container automatically.
- If the inventory service returns a non-2xx response (e.g. not enough stock), we read the error from the body and throw it, which causes the `catch` block to return the error to the client.
- If the response is OK, execution continues and the order gets confirmed.

---

## Part 3: RabbitMQ Messaging

### Why RabbitMQ here?

Once the order is confirmed, you might want other systems to react — a warehouse system, an email notifier, an analytics service. You don't need to call those synchronously. The order is already placed; those systems can catch up when they're ready.

RabbitMQ lets the order service **fire and forget**: it drops a message onto a queue and moves on. Any number of consumers can listen to that queue independently, without the order service knowing or caring who they are.

### How a queue works

```
Producer                      Queue                    Consumer
(order-service)               "order.placed"           (inventory-service)
      │                             │                         │
      │──── sendToQueue ───────────►│                         │
      │                             │──── consume ───────────►│
      │                             │     callback fires      │
      │                             │◄─── ack ────────────────│
```

- `channel.assertQueue(name)` — creates the queue if it doesn't exist. Safe to call on both producer and consumer.
- `channel.sendToQueue(name, buffer)` — puts a message onto the queue as raw bytes.
- `channel.consume(name, callback)` — registers a function that fires each time a message arrives.
- `channel.ack(msg)` — tells RabbitMQ the message was processed and can be removed from the queue.

### 3.1 Connect to RabbitMQ in the order service

**File:** `order-service/src/index.js`

**Find:** The `// TODO (Part 3)` comment inside the `main()` function.

Try writing the connection setup yourself. It should connect using `connectWithRetry` (already defined in the file), create a channel, and assert the `order.placed` queue.

<details>
<summary>Show solution</summary>

```js
const connection = await connectWithRetry(RABBITMQ_URL);
channel = await connection.createChannel();
await channel.assertQueue("order.placed", { durable: false });
console.log("Connected to RabbitMQ");
```

</details>

### 3.2 Publish an event when an order is placed

**File:** `order-service/src/index.js`

**Find:** The `// TODO (Part 3)` comment inside the `POST /orders` handler.

Try writing the publish call yourself. It should send the `order` object as a JSON message to the `order.placed` queue.

<details>
<summary>Show solution</summary>

```js
channel.sendToQueue("order.placed", Buffer.from(JSON.stringify(order)));
console.log(`Published order.placed event for order #${order.id}`);
```

</details>

RabbitMQ messages are raw bytes. `JSON.stringify` converts the order object to a string, and `Buffer.from` wraps it in bytes that AMQP can transmit.

### 3.3 Consume the event in the inventory service

**File:** `inventory-service/src/index.js`

**Find:** The `// TODO (Part 3)` comment inside the `main()` function.

Try writing the consumer yourself. It should listen on the `order.placed` queue, parse each message, log it, and acknowledge it.

<details>
<summary>Show solution</summary>

```js
channel.consume("order.placed", (msg) => {
  if (msg === null) return;
  const order = JSON.parse(msg.content.toString());
  console.log(`[inventory-service] Received order.placed event:`, order);
  channel.ack(msg);
});
console.log("Listening for order.placed events");
```

</details>

`msg.content` is a `Buffer`. `.toString()` converts it back to a string so `JSON.parse` can reconstruct the original object. `channel.ack(msg)` removes the message from the queue once it has been processed.

---

## Part 4: Wire Everything Together in Docker Compose

Docker Compose is how you run all three services together. Each service gets its own container, and Docker's internal network lets them find each other by service name.

### 4.1 How Docker networking works

When a service is named `inventory-service` in `docker-compose.yml`, other containers can reach it at `http://inventory-service:3000` — no IP address needed. This is why environment variables like `INVENTORY_URL` and `RABBITMQ_URL` exist: you set them to Docker service names so containers can communicate.

### 4.2 Add the inventory-service

**File:** `docker-compose.yml`

**Find:** The commented-out `inventory-service` block and uncomment it.

<details>
<summary>Show solution</summary>

```yaml
inventory-service:
  image: inventory-service
  build:
    context: ./inventory-service
    dockerfile: Dockerfile
  container_name: inventory-service
  environment:
    - PORT=3000
    - RABBITMQ_URL=amqp://rabbitmq
  depends_on:
    - rabbitmq
  restart: "no"
```

</details>

| Field | Value | Why |
|-------|-------|-----|
| `RABBITMQ_URL` | `amqp://rabbitmq` | `rabbitmq` is the service name — Docker resolves it to the broker container |
| `depends_on` | `rabbitmq` | Ensures RabbitMQ starts before this service tries to connect |
| no `ports` | — | This service is internal only — only other containers can reach it |

### 4.3 Add the order-service

**File:** `docker-compose.yml`

**Add** the `order-service` block below `inventory-service`.

<details>
<summary>Show solution</summary>

```yaml
order-service:
  image: order-service
  build:
    context: ./order-service
    dockerfile: Dockerfile
  container_name: order-service
  ports:
    - "3001:3001"
  environment:
    - PORT=3001
    - INVENTORY_URL=http://inventory-service:3000
    - RABBITMQ_URL=amqp://rabbitmq
  depends_on:
    - rabbitmq
    - inventory-service
  restart: "no"
```

</details>

| Field | Value | Why |
|-------|-------|-----|
| `ports` | `"3001:3001"` | Exposes this service to your laptop so you can send requests to it |
| `INVENTORY_URL` | `http://inventory-service:3000` | Points to the inventory container by service name |
| `depends_on` | `rabbitmq, inventory-service` | Both must be running before the order service starts |

### 4.4 Start the full stack

```bash
docker-compose up --build
```

Once you see all three of these lines the system is fully running:

```
inventory-service  | Listening for order.placed events
order-service      | Connected to RabbitMQ
order-service      | Order service running on port 3001
```

### 4.5 Try it

Place an order:

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"itemId": 1, "quantity": 2, "customerName": "Alice"}'
```

In the logs you should see both communication patterns fire:
1. `order-service` calls `inventory-service` over HTTP to reserve stock
2. `order-service` publishes a message — `inventory-service` logs it after receiving it from the queue

Open the RabbitMQ management UI at `http://localhost:15672` (login: `guest` / `guest`) and click **Queues** to see the `order.placed` queue.

### 4.6 Stop everything

```bash
docker-compose down
```

---

## Summary: HTTP vs. RabbitMQ

| | HTTP (synchronous) | RabbitMQ (asynchronous) |
|---|---|---|
| **When to use** | You need an answer before you can continue | You don't need to wait for a response |
| **Coupling** | Tight — sender must know the receiver's URL | Loose — sender only knows the queue name |
| **If the receiver is down** | Request fails immediately | Messages queue up and are delivered when it recovers |
| **Used for in this activity** | Reserving stock — must succeed before confirming | Notifying other systems after the order is confirmed |