const express = require("express");
const router = express.Router();

// "Database" (in-memory)
let nextId = 7;
const products = [
    {
        id: 1,
        title: "iPad (9th Gen) 64GB Wi-Fi",
        price: 220,
        condition: "good", // new | like_new | good | fair | parts
        category: "Electronics",
        description: "Includes case + charger. Minor scuffs on back, screen is clean.",
        seller: "Ethan",
        location: "Fredericton, NB",
        isSold: false,
        createdAt: "2026-01-05",
    },
    {
        id: 2,
        title: "Nintendo Switch (V2) + 2 Games",
        price: 260,
        condition: "like_new",
        category: "Gaming",
        description: "Barely used. Includes dock, joy-cons, and two physical games.",
        seller: "Jordan",
        location: "Moncton, NB",
        isSold: false,
        createdAt: "2026-01-06",
    },
    {
        id: 3,
        title: "Desk Chair (Mesh, Adjustable)",
        price: 60,
        condition: "fair",
        category: "Furniture",
        description: "Comfortable, fully functional. Armrests show wear.",
        seller: "Sam",
        location: "Saint John, NB",
        isSold: false,
        createdAt: "2026-01-08",
    },
    {
        id: 4,
        title: "Road Bike - 54cm Frame",
        price: 450,
        condition: "good",
        category: "Sports",
        description: "Recently tuned. New chain last summer. Great commuter bike.",
        seller: "Taylor",
        location: "Fredericton, NB",
        isSold: false,
        createdAt: "2026-01-09",
    },
    {
        id: 5,
        title: "Winter Jacket (Mens M)",
        price: 40,
        condition: "good",
        category: "Clothing",
        description: "Warm and clean, no rips. Zipper works perfectly.",
        seller: "Alex",
        location: "Moncton, NB",
        isSold: true,
        createdAt: "2026-01-02",
    },
    {
        id: 6,
        title: "Textbook: Web Development (Latest Edition)",
        price: 25,
        condition: "good",
        category: "Books",
        description: "Highlighting on a few pages. Otherwise excellent condition.",
        seller: "Morgan",
        location: "Fredericton, NB",
        isSold: false,
        createdAt: "2026-01-10",
    },
];


// TODO: Implement GET, GET/:id, POST, DELETE for /products

router.get("/", (req, res) => {
    res.json(products);
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);

    if(!product) {
        return res.status(404).json({error: "Product not found"});
    }

    res.json(product);
});

router.post("/", (req, res) => {
    const {title, price, condition, category, description, seller, location } = req.body;

    if( !title || !price || !condition || !description || !seller || !location) {
        return res.status(400).json({ error: "title, price, condition, description, seller, and location are required."});
    }

    const newProduct = {id: nextId++, title, price, condition, category, description, seller, location };
    products.push(newProduct);

    res.status(201).json(newProduct);
});

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex((p) => p.id === id);

    if(index === -1) {
        return res.status(404).json({ error: "Product not found "});
    }

    const deleted = products.splice(index, 1)[0];
    res.json({ message: "Product deleted", deleted });
});