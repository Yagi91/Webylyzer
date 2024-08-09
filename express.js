const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/", require("./routes/analyzeHTML.routes"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app;

module.exports = server;
