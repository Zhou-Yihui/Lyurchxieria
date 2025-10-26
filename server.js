// server.js
const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const app = express();
app.use(cors());
app.use(express.json());

const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: {} };   // 初始结构

/* --------- 工具 --------- */
const msg = (res, txt) => res.json({ ok: false, msg: txt });
const ok = (res, data = null) => res.json({ ok: true, data });

/* --------- 注册 --------- */
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return msg(res, '用户名密码必填');
  if (db.data.users[username]) return msg(res, '用户已存在');
  db.data.users[username] = { password, inbox: [], sent: [], drafts: [], trash: [] };
  await db.write();
  ok(res);
});

/* --------- 登录 --------- */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.data.users[username];
  if (!user || user.password !== password) return msg(res, '用户名或密码错误');
  ok(res, { username });   // 返回用户名给前端存
});

/* --------- 取用户数据 --------- */
app.get('/api/user/:username', async (req, res) => {
  const user = db.data.users[req.params.username];
  if (!user) return msg(res, '用户不存在');
  ok(res, user);
});

/* --------- 更新用户数据 --------- */
app.put('/api/user/:username', async (req, res) => {
  const user = db.data.users[req.params.username];
  if (!user) return msg(res, '用户不存在');
  Object.assign(user, req.body);   // 整体替换
  await db.write();
  ok(res);
});

/* --------- 启动 --------- */
app.listen(3000, () => console.log('本地后端已启动 → http://localhost:3000'));
