# Activity 4
The goal of this activity is to teach you about authentication with JWT. Included in this folder is a demo application that has authentication working. Spend some time looking over the code to make sure that you understand how it is working.

**Todo 1:** Run `npm install` to install all of the necessary dependencies. 

**Todo 2:** Start the server `export JWT_SECRET="SWE213"; npm run dev`. 
- Note: You have to set the environment variable or it won't work!

**Todo 3:** Open and run the Bruno collection. All tests (except the last one) should pass meaning that your login API is working. 

**Todo 4:** Update the product endpoint to meet the following criteria:
- When logged in as admin you can see all products. 
- When logged in as a user you should only be able to see your products. 

<details>
  <summary>Reveal Answer</summary>

```JS
app.get("/products", auth.auth, (req, res) => {
    if (req.user.role === "user") {
        const userProducts = products.filter(p => p.userId === req.user.id);
        res.json(userProducts);
    } else {
        res.json(products);
    }
});
```
</details>
<br>

**Todo 5:** Re-run your Bruno collection. Now all tests should be green. 