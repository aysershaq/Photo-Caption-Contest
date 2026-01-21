// src/cache/imageCache.js
const NodeCache = require("node-cache");

// مثال: خزّن النتائج 60 ثانية
const imageCache = new NodeCache({
  stdTTL: 60,       // TTL افتراضي لكل عنصر (ثواني)
  checkperiod: 120, // تنظيف العناصر المنتهية (ثواني)
  useClones: false  // أداء أفضل لو بتخزن JSON كبير (اختياري)
});

module.exports = imageCache;
