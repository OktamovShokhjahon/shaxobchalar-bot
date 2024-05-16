const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

app.use(express.json());

require("./bot/bot");

const dev = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB Connected"))
      .catch((err) => console.log(err));

    const PORT = process.env.PORT || 4100;
    app.listen(PORT, () =>
      console.log("Server started on http://localhost:" + PORT)
    );
  } catch (err) {
    console.log(err);
  }
};

dev();
