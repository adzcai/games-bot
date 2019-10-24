const { Router } = require('express');
const axios = require('axios').default;
const asyncMiddleware = require('../asyncMiddleware');

const router = new Router();

router
  .get('/', (req, res) => res.render('pages/index'))
  .get('/commands', (req, res) => res.render('pages/commands'))
  .get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  })
  .get('/random-math-question', asyncMiddleware(async (req, res) => {
    const { data } = await axios.get('https://studycounts.com/api/v1/algebra/linear-equations.json');
    res.render('pages/random_math_question', { data });
  }))
  .post('/random-math-question', asyncMiddleware(async (req, res) => {
    const { questionId, answer } = req.body;
    const { data } = await axios.get(`https://studycounts.com/api/v1/algebra/linear-equations/${questionId}.json`);
    res.send({ solved: parseInt(answer, 10) === data.correct_choice });
  }));

module.exports = router;
