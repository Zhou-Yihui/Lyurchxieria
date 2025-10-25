// scms-backend.js
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// 初始化数据库
const db = new sqlite3.Database("./scms.db", (err) => {
  if(err) console.error(err);
  else console.log("SQLite 数据库已连接 / Database ready");
});

// 创建表
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS mails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    receiver TEXT,
    subject TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 注册
app.post("/api/register", (req,res)=>{
  const {email,password} = req.body;
  if(!email || !password) return res.json({success:false,message:"用户名和密码不能为空 / Fields required"});
  const hash = bcrypt.hashSync(password,10);
  db.run("INSERT INTO users(email,password) VALUES(?,?)",[email,hash], function(err){
    if(err) return res.json({success:false,message:"用户名已存在 / User exists"});
    res.json({success:true,message:"注册成功 / Registered successfully"});
  });
});

// 登录
app.post("/api/login",(req,res)=>{
  const {email,password} = req.body;
  if(!email || !password) return res.json({success:false,message:"用户名和密码不能为空 / Fields required"});
  db.get("SELECT * FROM users WHERE email=?",[email],(err,row)=>{
    if(err) return res.json({success:false,message:"数据库错误 / DB Error"});
    if(!row) return res.json({success:false,message:"用户不存在 / User not found"});
    const match = bcrypt.compareSync(password,row.password);
    if(match) res.json({success:true,message:"登录成功 / Login success"});
    else res.json({success:false,message:"密码错误 / Wrong password"});
  });
});

// 获取收件箱
app.get("/api/inbox/:email",(req,res)=>{
  const email = req.params.email;
  db.all("SELECT sender as from, subject, content FROM mails WHERE receiver=? ORDER BY timestamp DESC",[email],(err,rows)=>{
    if(err) return res.json([]);
    res.json(rows);
  });
});

// 获取发件箱
app.get("/api/sent/:email",(req,res)=>{
  const email = req.params.email;
  db.all("SELECT receiver as to, subject, content FROM mails WHERE sender=? ORDER BY timestamp DESC",[email],(err,rows)=>{
    if(err) return res.json([]);
    res.json(rows);
  });
});

// 发送邮件
app.post("/api/send",(req,res)=>{
  const {from,to,subject,content} = req.body;
  if(!from||!to||!subject||!content) return res.json({success:false,message:"所有字段不能为空 / All fields required"});
  db.get("SELECT * FROM users WHERE email=?",[to],(err,row)=>{
    if(err) return res.json({success:false,message:"数据库错误 / DB Error"});
    if(!row) return res.json({success:false,message:"收件人不存在 / Receiver not found"});
    db.run("INSERT INTO mails(sender,receiver,subject,content) VALUES(?,?,?,?)",[from,to,subject,content],function(err){
      if(err) return res.json({success:false,message:"发送失败 / Send failed"});
      res.json({success:true,message:"邮件已发送 / Mail sent"});
    });
  });
});

app.listen(PORT,()=>console.log(`SCMS 后端运行在 http://localhost:${PORT}`));
