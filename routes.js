import express from "express";
import { User, Mail } from "./models.js";
export const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const exist = await User.findOne({ email });
  if (exist) return res.json({ success: false, message: "该邮箱已注册" });
  await User.create({ email, password });
  res.json({ success: true, message: "注册成功" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false, message: "账号或密码错误" });
  res.json({ success: true, user });
});

router.post("/send", async (req, res) => {
  const mail = await Mail.create(req.body);
  res.json({ success: true, message: "邮件已发送", mail });
});

router.get("/inbox/:email", async (req, res) => {
  const mails = await Mail.find({ to: req.params.email });
  res.json(mails);
});
