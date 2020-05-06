const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");

const axios = require("axios");

var cors = require("cors");

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  let id = randomBytes(4).toString("hex");

  const { title } = req.body;

  console.log(` getting post from client ${title}`);
  posts[id] = {
    id,
    title,
  };

  await axios.post("http://event-bus-srv:4005/event", {
    type: "PostCreate",
    data: {
      id,
      title,
    },
  });

  res.status(201).send(posts[id]);
});

app.post("/event", (req, res) => {
  console.log(`Recieved event of type ${req.body.type}`);
});

app.listen(4000, () => {
  console.log(`New version deployment for kubenatics`);
  console.log(`Posts application is running on the port 4000`);
});
