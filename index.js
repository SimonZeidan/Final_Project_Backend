const express = require("express");
const app = express();

const DB = require("./database");

DB();

app.use(express.json());
app.listen(process.env.PORT, ()=>{
    console.log(`Listening on port ${process.env.PORT}`);
})