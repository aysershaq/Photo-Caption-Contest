const votesRouter = require('express').Router();
const { ensureAuth } = require('../middlewares/auth');
const votesController = require('../controllers/votesControllers');
const verifyToken = require('../middlewares/jwt');
// Vote (add)
votesRouter.post('/add-vote/:captionId',verifyToken, ensureAuth, votesController.createVote);

// Unvote (remove)
votesRouter.delete('/delete-vote/:captionId',verifyToken, ensureAuth, votesController.deleteVote);

// Vote stats for a caption
votesRouter.get('/captions/:captionId', verifyToken,ensureAuth, votesController.getCaptionVoteStats);

module.exports = votesRouter;
