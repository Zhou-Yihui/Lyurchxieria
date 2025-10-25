import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { router } from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("你的MongoDB Atlas连接地址", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SCMS 后端运行在端口 ${PORT}`));
