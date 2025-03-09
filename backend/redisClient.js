const Redis = require("ioredis");
require("dotenv").config();

const redisClient = new Redis(process.env.REDIS_URL);
// "redis://localhost:6379";

redisClient.on("connect", () => {
  console.log("Connected to Redis! 🚀");
  console.log(typeof redisClient.set);
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisClient;
