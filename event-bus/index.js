const express = require("express");

const bodyParser = require("body-parser");
const axios = require("axios");
var cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

const events = [];

app.post("/event", (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post("http://posts-clusterip-srv:4000/event", event);

  axios.post("http://comments-srv:4001/event", event);

  axios.post("http://query-srv:4002/event", event);

  axios.post("http://moderator-srv:4003/event", event);

  console.log("event.type => " + event.type);

  res.send({});
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log(`New version deployed`);
  console.log(`Event bus is running on port 4005`);
});
