// src/middleware/cacheMiddleware.js
const imageCache = require("../imageCache");

function cacheResponse(ttlSeconds = 60) {
  
  return (req, res, next) => {
    // عادة نخلي الكاش للـ GET فقط


    if (req.method !== "GET") return next();

    const key = `images:${req.originalUrl}`;
    const cached = imageCache.get(key);

    if (cached) {
      return res.status(200).json(cached);
    }

    // لفّ res.json لتخزين النتيجة
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // خزّن فقط لو الحالة 200 (اختياري)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        imageCache.set(key, body, ttlSeconds);
      }
      return originalJson(body);
    };

    console.log("inside middleware")
    next();
  };
}

module.exports = { cacheResponse };
