const db = require("../models/index")

function ensureAdmin(req, res, next) {
 console.log("inside ensureAdmin ")
if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }

  next();
};



   function ensureAuth(req, res, next) {
     console.log("inside ensureAuth ")

  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  console.log("after if ",req.user)
  next();
};

module.exports ={ensureAdmin,ensureAuth}