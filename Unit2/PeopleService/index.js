const express = require("express");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3004;

const people = {
    'sierra': {
         name: "Sierra", 
         age : 21,
         program: "Computer Science"
    },

    'paige': { 
         name: "Paige", 
         age: 24,
         program: "Family Studies"
    },
    'sarah': {
         name: "Sarah", 
         age: 20,
         program: "Physical Education"
    }
};

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the People API! Use /sample to see all people and /sample/:name to get information about a person."
    })
});

app.get("/sample", (req, res) => {
    res.json(people);
});

app.get("/sample/:name", (req, res) => {
    const name = req.params.name.toLowerCase();
    const person = people[name];

    if(person) {
        res.json(person);
    }
    else {
        res.status(404).json({ error: "Person not found"});
    }
});

app.listen(port, () => {
    console.log(` http://localhost:${port}`);
    console.log(` http://localhost:${port}/sample`);
    console.log(` http://localhost:${port}/sample/sierra`);
});