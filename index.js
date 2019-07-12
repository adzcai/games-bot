const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const commands = require('./src/internal/getCommands');

const PORT = process.env.PORT || 5000;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];

passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: `http://localhost:${PORT}/api/discord/callback`,
  scope: scopes,
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

express()
  .use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static(path.join(__dirname, 'public')))
  // .use('/api/discord', require('./api/discord'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/commands', (req, res) => res.render('pages/commands', { commands }))
  .use('/api/discord/login', passport.authenticate('discord', { scope: scopes }))
  .get('/api/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/loggedin',
  }))
  .use('/api/discord/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  })
  .get('/loggedin', (req, res) => {
    res.send('You have been logged in');
  })
  .use((req, res, next) => {
    res.status(404).render('pages/404');
  })
  .use((err, req, res, next) => {
    switch (err.message) {
      case 'NoCodeProvided':
        return res.status(400).send({
          status: 'ERROR',
          error: err.message,
        });
      default:
        return res.status(500).send({
          status: 'ERROR',
          error: err.message,
        });
    }
  })
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
