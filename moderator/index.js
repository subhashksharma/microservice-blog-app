const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());

app.post("/event", async (req, res) => {
  console.log(`Moderator is recieving the comment---`);

  const { data, type } = req.body;
  let status = "pending";

  if (type === "CommentCreated") {
    const content = data.content;

    if (content.includes("orange")) {
      status = "reject";
    } else {
      status = "approved";
    }

    await axios.post("http://event-bus-srv:4005/event", {
      type: "CommentModerated",
      data: {
        id: data.id,
        content: content,
        postId: data.postId,
        status,
      },
    });
  }

  res.send({});
});

app.listen(4003, () => {
  console.log(`Moderator is listenig on 4003 port`);
});
