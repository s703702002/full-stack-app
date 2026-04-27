import prisma from '../config/db.js';
import redisClient from '../config/redis.js';

export const checkHealth = async (req, res) => {
  // 基礎系統指標
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()), // Node.js 行程已運行的時間
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  let isSystemHealthy = true;

  try {
    // 執行最輕量的原生 SQL 查詢，確認資料庫連線真的活著
    await prisma.$queryRaw`SELECT 1`;
    healthData.services.database = 'connected';
  } catch (error) {
    healthData.services.database = 'disconnected';
    isSystemHealthy = false; // DB 掛了，系統算是不健康
    console.error('HealthCheck [DB Error]:', error.message);
  }

  try {
    // 先用你剛學到的 isReady 檢查底層 Socket
    if (redisClient.isReady) {
      // 真的發送一個 PING 指令，確保沒有卡死
      const pingResult = await redisClient.ping();
      if (pingResult === 'PONG') {
        healthData.services.redis = 'connected';
      }
    } else {
      healthData.services.redis = 'disconnected';
      // 💡 策略抉擇：如果 Redis 只是輔助（如 Rate Limit），可以不把 isSystemHealthy 設為 false
      // 如果 Redis 是核心（如儲存 Session），那這裡就要 isSystemHealthy = false;
    }
  } catch (error) {
    healthData.services.redis = 'error';
    console.error('HealthCheck [Redis Error]:', error.message);
  }

  // 🚀 3. 決定最終的 HTTP 狀態碼
  // 正常回 200；如果有致命錯誤回 503 (Service Unavailable)
  const statusCode = isSystemHealthy ? 200 : 503;
  if (!isSystemHealthy) {
    healthData.status = 'error';
  }

  res.status(statusCode).json(healthData);
};

// 輔助函式：將秒數轉成易讀的格式 (例如 1h 2m 3s)
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
