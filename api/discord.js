const { Router } = require('express');
const axios = require('axios');
const btoa = require('btoa');
const catchAsync = require('../src/util/catchAsync');

const { CLIENT_ID } = process.env;
const { CLIENT_SECRET } = process.env;
const { PORT } = process.env;
const redirect = encodeURIComponent(`http://localhost:${PORT || 5000}/api/discord/callback`);

const router = Router();

router
  .get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
  })
  .get('/callback', catchAsync(async (req, res) => {
    const { code } = req.query;
    if (!code) throw new Error('NoCodeProvided');

    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    axios(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    }).then((r) => {
      res.redirect(`/?token=${r.data.access_token}`);
    }).catch((err) => {
      console.log(err);
    });    
  }));

module.exports = router;
