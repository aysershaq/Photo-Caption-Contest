const { Sequelize } = require("sequelize");
const db = require("../models/index")
const path = require("path")
const fs = require("fs");

const sharp =  require("sharp")

const sanitizeCaption = require("../utils/sanitize")
const cache = new Map();
module.exports ={
getImageFile: async (req, res) => {
  try {
    const image = await db.Images.findByPk(req.params.id);
    if (!image) return res.status(404).json({ message: "image not found" });

    res.setHeader("Content-Type", "image/jpeg"); // لأنك حولتها jpeg عبر sharp
        console.log("imageData length:", image.imageData?.length);
    return res.send(image.imageData);
  
   



  } catch (err) {
    return res.status(500).json({ message: "failed", error: err.message });
  }
},
  addNewImage:async (req, res) => {
    try {
      const fileBuffer = req.file.buffer;                  // الحصول على Buffer الصورة المرفوعة
     const compressedBuffer =await sharp(fileBuffer)     // ضغط الصورة 
    .resize({ width: 1000 })
    .jpeg({ quality: 80 })
    .toBuffer();
      // خزّن metadata + الرابط في DB
      const image = await db.Images.create({
        
        imageData: compressedBuffer,
        alt: req.body.alt || null,
      
       
      });
  
      return res.status(201).json({
        message: "Image uploaded successfully",
        image: {
          id: image.id,
          url: image.imageUrl,
          alt: image.alt,
          mimeType: image.mimeType,
          sizeBytes: image.sizeBytes,
        },
      });
    } catch (err) {
      return res.status(500).json({ 
        
        message: "Upload failed",
         error: err.message ,
         details: err?.errors?.map(e => ({
      message: e.message,
      path: e.path,
      value: e.value,
      validatorKey: e.validatorKey
        
        
        }))
    })
  }},
  getAllImages:async(req,res)=>{
  try{

     // تحقق إن كانت النتيجة مخزنة مؤقتًا
    
  const images =await db.Images.findAll();
      const host = req.get("host");
 

  const result = images.map(img => ({
    id: img.id,
    alt: img.alt,
    url: `/api/image/${img.id}`,
  }));

  return res.json({ status: "done", images:result});
 
    
 
  }catch(err){


    res.status(500).json({status:"failed retriving all images.",error:err.message})
  }
},
 

getImageById:async(req,res)=>{
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid envelope ID' });
  }

    try{
        const image = await db.Images.findAll({
          where:{
              id:req.params.id
          }
        })
        console.log(image)
        if(image.length===0){
                  
          
          res.status(404).json({status:"image not found"})

        }
           res.setHeader("Content-Type", "image/jpeg"); // لأنك حولتها لـ jpeg في sharp

                res.status(200).json({status:"image retrived successfully",image:image})

    }catch(err){

        res.status(500).json({ error: 'Internal server error' });

    }
  },
  addNewCaption:async(req,res)=>{
    const rawText = req.body.caption;
const text = sanitizeCaption(rawText);
if (text.length === 0 || text.length > 250) {
  return res.status(400).json({ error: "نص التسمية التوضيحية مطلوب ويجب أن لا يتجاوز 250 حرفًا." });
}
     try {
      const { caption } = req.body;
       const image = await db.Images.findOne({where:{id:req.params.id}});
        
      if (!image) {
        return res.status(404).json({ message: "image not found" });
      }
      if (!caption) {
        return res.status(400).json({ message: "caption is required" });
      }
 
      const user = await db.Users.findOne()
          const imageId = image.id;
    const userId = req.user.id;
      const existing = await db.Captions.findOne({ where: { imageId, userId } });

if (existing) {
  return res.status(409).json({
    message: "لا يمكنك إضافة أكثر من تعليق واحد على نفس الصورة.",
  });
}

      const Caption = await db.Captions.create({text: caption,imageId:image.id,userId: req.user.id});
  
      return res.status(200).json({
        message: "caption added successfully",
        Caption,
      });
    } catch (error) {
      return res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  },
  deleteImage:async(req,res)=>{
  try{
  const image =await db.Images.findOne({where:{
    id:req.params.id
  }})

   if(image===null){
    res.send("image Not found")
   }else{

     // 2️⃣ تحويل الرابط المخزن إلى مسار فعلي
    // image.imageUrl مثال: /uploads/abc123.jpg
    // const imagePath = path.join(
    //   __dirname,
    //   "..",   
  
    //   image.imageUrl
    // );
    // console.log(imagePath)
    // // 3️⃣ حذف الملف من مجلد uploads
    // if (fs.existsSync(imagePath)) {
    //   fs.unlinkSync(imagePath);
    // }
   await  db.Images.destroy({
    where:{
      id:req.params.id
    }
  })
   return res.json({status:"image deleted successfully",image:image})
}
   }catch(err){
  res.status(500).json({err:err.message})
}
  },

 

deleteCaption:async (req, res, next) => {
  try {
    const captionId = Number(req.params.id);
    const currentUser = req.user;

    if (!captionId || Number.isNaN(captionId)) {
      return res.status(400).json({ error: 'captionId not valid' });
    }

    // 1️⃣ التأكد أن الـCaption موجود
    const caption = await db.Captions.findByPk(captionId);

    if (!caption) {
      return res.status(404).json({ error: 'Caption not found' });
    }

    // 2️⃣ Authorization
    const isOwner = caption.userId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'not authorized to delete the caption'
      });
    }

    // 3️⃣ حذف الـCaption
    await db.Captions.destroy({where:{id:captionId}});

    return res.json({
      message: 'caption deleted successfully',
      captionId
    });
  } catch (err) {
    return next(err);
  }

},
getAllCaptionsOfImage: async (req, res) => {
  try {
    const imageId = Number(req.params.id);
    const userId = req.user.id;

    const captions = await db.Captions.findAll({
      where: { imageId },
      attributes: {
        include: [
          // ✅ العدد الكلي للأصوات
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Votes" v
              WHERE v."captionId" = "Captions"."id"
            )`),
            "votesCount",
          ],

          // ✅ هل المستخدم الحالي صوّت؟
          [
            Sequelize.literal(`EXISTS (
              SELECT 1
              FROM "Votes" v2
              WHERE v2."captionId" = "Captions"."id"
                AND v2."userId" = ${userId}
            )`),
            "hasVoted",
          ],
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    const result = captions.map(c => ({
      id: c.id,
      text: c.text,
      userId: c.userId,
      votesCount: Number(c.get("votesCount")) || 0,
      hasVoted: Boolean(c.get("hasVoted")),
    }));

    return res.status(200).json({
      status: "success",
      captions: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}}