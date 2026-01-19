const express = require("express");
const router = express.Router();

// "Database" (in-memory)
let nextId = 3;
const users = [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
    { id: 2, name: "Alan Turing", email: "alan@example.com" },
];

// GET /users
router.get("/", (req, res) => {
    res.json(users);
});

// GET /users/:id
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
});

// POST /users
router.post("/", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
    }

    const newUser = { id: nextId++, name, email };
    users.push(newUser);

    res.status(201).json(newUser);
});

// DELETE /users/:id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) return res.status(404).json({ error: "User not found" });

    const deleted = users.splice(index, 1)[0];
    res.json({ message: "User deleted", deleted });
});


module.exports = router;