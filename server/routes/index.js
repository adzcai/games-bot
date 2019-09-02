const { Router } = require('express');

const router = new Router();

router
  .get('/', (req, res) => res.render('pages/index'))
  .get('/commands', (req, res) => res.render('pages/commands'))
  .get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

module.exports = router;
