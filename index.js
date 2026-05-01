const express = require("express");
const { WebcastPushConnection } = require("tiktok-live-connector");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================
// STATUS SERVER (RENDER KEEP ALIVE)
// =========================
app.get("/", (req, res) => {
  res.send("DONATION CLOUD V3 ONLINE");
});

// =========================
// QUEUE SYSTEM
// =========================
let queue = [];

// =========================
// TIKTOK ACCOUNTS
// =========================
const USERS = [
  "abayy.026b",
  "indo.friends"
];

// =========================
// START TIKTOK
// =========================
function startTikTok(user) {
  const tiktok = new WebcastPushConnection(user);

  const connect = async () => {
    try {
      await tiktok.connect();
      console.log("LIVE:", user);
    } catch (err) {
      console.log("RETRY:", user);
      setTimeout(connect, 5000);
    }
  };

  connect();

  tiktok.on("gift", (data) => {
    const gift = {
      user: data.uniqueId,
      gift: data.giftName,
      count: data.repeatCount || 1,
      host: user,
      time: Date.now()
    };

    queue.push(gift);
    console.log("GIFT:", gift);
  });

  tiktok.on("disconnected", () => {
    setTimeout(connect, 5000);
  });
}

// START ALL ACCOUNTS
USERS.forEach(startTikTok);

// =========================
// ROBLOX FETCH
// =========================
app.get("/roblox", (req, res) => {
  if (queue.length === 0) return res.json({});

  const data = queue.shift();
  res.json(data);
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log("SERVER RUNNING:", PORT);
});