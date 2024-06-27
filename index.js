const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use(userRoutes);

//execute
// connecting to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connection successful");
    app.get("/", (req, res) => res.send("scoialechobackend server running"));
    app.listen(port, () => console.log("server listening on port ", port));
  })
  .catch((err) => console.log(err.message));
