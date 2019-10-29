const { Router } = require('express');

const Score = require('../models/Score');
const asyncMiddleware = require('../asyncMiddleware');

const router = new Router();

router.get('/games/rock_paper_scissors', (req, res) => res.render('pages/games/rock_paper_scissors'));
router.get('/profile', asyncMiddleware(async (req, res) => {
  let scores = await Score.find({ userId: req.user.id });
  const totalScore = scores.map(entry => entry.score).reduce((a, b) => a + b);
  scores = scores.map(entry => ({
    score: entry.score,
    guild: req.user.guilds.find(guild => guild.id === entry.serverId),
  }));
  res.render('pages/profile', { scores, totalScore });
}));

module.exports = router;
