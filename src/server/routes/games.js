const { Router } = require('express');

const router = new Router();

router.get('/rock_paper_scissors', (req, res) => res.render('pages/games/rock_paper_scissors'));

module.exports = router;
