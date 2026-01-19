const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// TODO: Add products router
const productsRouter = require("./routes/products");
app.use("/products", productsRouter);

productsRouter.get("/", (req, res) => {
    res.json(products)
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
 