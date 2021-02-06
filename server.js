require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

const URL = process.env.MONGO_DB_URL
mongoose.connect(URL, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (error) => {
  if (error) {
    throw error
  }
  console.log("Connected to mongoDB");
})

const post = process.env.POST || 5000;
app.listen(post, () => {
  console.log("Server is running on post.", post);
});
