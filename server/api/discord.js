const { Router } = require('express');
const passport = require('passport');
const { Strategy } = require('passport-discord');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const scopes = ['identify', 'guilds', 'guilds.join'];

passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'local' ? `http://localhost:${process.env.PORT || 5000}/api/discord/callback` : 'https://thepiguy-games-bot.herokuapp.com/api/discord/callback',
  scope: scopes,
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

const router = new Router();
router
  .use('/login', passport.authenticate('discord', { scope: scopes }))
  .get('/callback', passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/commands',
  }))
  .use('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

module.exports = router;
