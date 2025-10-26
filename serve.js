// serve.js  —— 零配置本地后端
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const app     = express();
app.use(cors());                 // 关 CORS
app.use(express.json());         // 解析 JSON

const DB_FILE = 'db.json';
// 如果 db.json 不存在就自动建空库
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{"users":{}}');
const db = JSON.parse(fs.readFileSync(DB_FILE));

// 注册
app.post('/api/register', (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) return res.json({ok: false, msg: '必填'});
  if (db.users[username]) return res.json({ok: false, msg: '用户已存在'});
  db.users[username] = {password, inbox: [], sent: [], drafts: [], trash: []};
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  res.json({ok: true});
});

// 登录
app.post('/api/login', (req, res) => {
  const {username, password} = req.body;
  const user = db.users[username];
  if (!user || user.password !== password) return res.json({ok: false, msg: '用户名或密码错误'});
  res.json({ok: true, data: {username}});
});

// 取用户数据
app.get('/api/user/:username', (req, res) => {
  const user = db.users[req.params.username];
  if (!user) return res.json({ok: false, msg: '用户不存在'});
  res.json({ok: true, data: user});
});

// 更新用户数据
app.put('/api/user/:username', (req, res) => {
  const user = db.users[req.params.username];
  if (!user) return res.json({ok: false, msg: '用户不存在'});
  Object.assign(user, req.body);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  res.json({ok: true});
});

// 自动找可用端口
const server = app.listen(0, () => {
  const port = server.address().port;
  console.log(`本地后端已启动 → http://localhost:${port}`);
  console.log(`测试地址: http://localhost:${port}/api/user/test`);
});
