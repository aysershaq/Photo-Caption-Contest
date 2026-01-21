

const express = require("express")
const db = require("../models"); 
const bcrypt = require("bcrypt")
const rateLimit = require('express-rate-limit');
const usersController = require("../controllers/usersConrollers");
const { ensureAuth ,ensureAdmin } = require("../middlewares/auth");
const userRouter =  express.Router();
const verifyToken = require("../middlewares/jwt")

const {validateRegistration} =  require("../middlewares/validate")

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // الحد الأقصى 5 محاولات لكل IP
  message: "عدد كبير جدًا من محاولات تسجيل الدخول. حاول مرة أخرى لاحقًا."
});



userRouter.get("/allUsers",usersController.getAllUsers)


userRouter.get("/user/:id",usersController.getUserById)
  

userRouter.delete("/user/:id",verifyToken,ensureAdmin,usersController.deleteUser)

userRouter.post("/register", validateRegistration,usersController.addNewUser);


userRouter.post("/login",loginLimiter,usersController.logInUser)

userRouter.post("/logout", usersController.logOutUser);
userRouter.patch("/users/:id/role",verifyToken,ensureAuth,ensureAdmin,usersController.updateUserRole)
module.exports = userRouter