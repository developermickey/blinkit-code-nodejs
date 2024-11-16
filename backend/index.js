const express = require("express");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); // Fixed typo
const helmet = require("helmet");
const connectDB = require("./config/connectDB");
const userRouter = require("./routes/userRoute");

dotenv.config();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // Example: log requests with "dev" format
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const port = process.env.PORT || 8080; // Corrected order

app.get("/", (req, res) => {
  res.send("Server Running Successfully!");
});

app.use("/api/user", userRouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server Running On Port ${port}`);
  });
});
