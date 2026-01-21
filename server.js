const express = require("express");

const jwt = require("jsonwebtoken")
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require("./swagger/swagger.json");
const path = require("path");
const fs = require("fs")
console.log("Uploads path:", path.join(__dirname, "uploads", "images"));
console.log("Images files:", fs.existsSync(path.join(__dirname, "uploads", "images"))
  ? fs.readdirSync(path.join(__dirname, "routes","uploads", "images")).slice(0, 5)
  : "Folder not found");
const userRouter = require("./routes/usersRoute")
const imagesRouter = require("./routes/imagesRoutes")
const votesRouter = require("./routes/votesRouts")
const db = require("./models"); // ✅ not "./models/index"
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
// في أعلى الملف (app.js أو service معين)
const NodeCache = require('node-cache');
const dotenv = require("dotenv")
const cache = new NodeCache({ stdTTL: 60 });

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = nodeEnv === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require('dotenv').config();
const PORT = process.env.PORT || 3000;
function sanitizeCaption(caption) {
  return sanitizeHtml(caption, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

const sharp = require('sharp');
// ملف buffer للصورة الأصلية (من multer أو قراءة ملف)


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // السماح لهذا النطاق فقط
  methods: ['GET','POST','PUT','DELETE','PATCH',"OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false // السماح بإرسال الكوكي/التوكن عبر الطلبات (إن لزم)
}));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(compression());
// يجعل أي ملف داخل uploads متاح عبر رابط:
// http://localhost:3000/uploads/...
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // لو فورم urlencoded

app.use(cookieParser());
app.use((err, req, res, next) => {
  console.error(err); // سيظهر الخطأ الحقيقي في التيرمنال
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});


app.use("/api",imagesRouter)

app.use("/api",userRouter)
app.use("/api",votesRouter)

app.get("/api", (req, res) => {
  res.send("hello world Welcome to Photo Caption Contest");
});

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully.");
console.log("DB:", db.sequelize.config.database);
console.log("HOST:", db.sequelize.config.host);
console.log("PORT:", db.sequelize.config.port);
console.log("USER:", db.sequelize.config.username);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
})();

module.exports = {app,sanitizeCaption}
