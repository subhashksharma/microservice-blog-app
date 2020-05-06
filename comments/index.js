const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const axios = require("axios");

var cors = require("cors");

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  let commentId = randomBytes(4).toString("hex");

  const comments = commentsByPostId[req.params.id] || [];
  const { content } = req.body;

  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;

  await axios.post("http://event-bus-srv:4005/event", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content: content,
      postId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/event", async (req, res) => {
  console.log(`Event recieved of type : ${req.body.type}`);
  if (req.body.type === "CommentModerated") {
    const { data, type } = req.body;

    const comments = commentsByPostId[data.postId];

    console.log("comments" + comments);

    const comment = comments.find((comment) => {
      return comment.id === data.id;
    });

    console.log("data.status in comment " + data.status);
    console.log("data.PostId in comment " + data.postId);

    comment.status = data.status;

    await axios.post("http://event-bus-srv:4005/event", {
      type: "CommentUpdated",
      data: {
        id: comment.id,
        content: comment.content,
        postId: data.postId,
        status: comment.status,
      },
    });
  }
});

app.listen(4001, () => {
  console.log(`Comments application is running on the port 4001`);
});
