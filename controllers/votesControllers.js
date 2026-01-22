const { Votes, Captions } = require('../models');
const db = require("../models/index")
exports.createVote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const  captionId  = Number(req.params.captionId);
      
    if (!captionId) {
      return res.status(400).json({ error: 'captionId مطلوب' });
    }

    // تأكد أن الـcaption موجود
    const caption = await db.Captions.findByPk(captionId);
    if (!caption) {
      return res.status(404).json({ error: 'Caption not found' });
    }

    const existingVotes = await db.Votes.findOne({where:{captionId,userId}})
    if(existingVotes){

          return res.status(409).send("You have already voted for this caption")
    }else{
    // إنشاء التصويت (الـUnique index سيمنع التكرار)
    const vote = await db.Votes.create({ userId, captionId });

    return res.status(201).json({
      message: 'تم التصويت بنجاح',
      voteId: vote.vote_id,
      captionId,
      userId
    });
  }
  } catch (err) {
    // PostgreSQL unique violation => 23505
    // Sequelize غالباً يرمي SequelizeUniqueConstraintError
   
    return res.json({error:err.message})
  }
};

exports.deleteVote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const  {captionId}  = req.params;

    if (!captionId) {
      return res.status(400).json({ error: 'captionId مطلوب' });
    }

    const deletedCount = await db.Votes.destroy({
      where: { userId, captionId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'You dont have vote to delete' });
    }

    return res.json({
      message: 'vote has been deleted sucessfully',
      captionId
    });
  } catch (err) {
    return next(err);
  }
};

exports.getCaptionVoteStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const captionId = Number(req.params.captionId);

    if (!captionId || Number.isNaN(captionId)) {
      return res.status(400).json({ error: 'captionId غير صالح' });
    }

    // تأكد أن الـcaption موجود
    const caption = await db.Captions.findByPk(captionId);
    if (!caption) {
      return res.status(404).json({ error: 'Caption غير موجود' });
    }

    const totalVotes = await db.Votes.count({ where: { captionId } });

    const userVoted = await db.Votes.findOne({
      where: { captionId, userId },
      
    });

    return res.json({
      captionId,
      totalVotes,
      hasVoted: Boolean(userVoted)
    });
  } catch (err) {
    return next(err);
  }
};

