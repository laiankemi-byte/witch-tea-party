const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const file = path.join(__dirname, "public", "index.html");
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("页面加载失败");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end("页面不存在");
});

const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  broadcast("一位茶会成员加入了。", ws);

  ws.on("message", (data) => {
    const message = data.toString();
    broadcast(message, ws);
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcast("一位茶会成员离开了。");
  });
});

function broadcast(message, exclude) {
  const text = typeof message === "string" ? message : String(message);
  for (const client of clients) {
    if (client !== exclude && client.readyState === 1) {
      client.send(text);
    }
  }
}

server.listen(PORT, () => {
  console.log("魔女茶会服务器已启动，端口：" + PORT);
});