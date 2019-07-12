require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');

require('./src/util/logger');
require('./bot');
require('./src/util/exitHandler');

const commands = require('./src/util/getCommands');

const PORT = process.env.PORT || 5000;

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];

passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.ENV === 'local' ? `http://localhost:${PORT}/api/discord/callback` : 'https://thepiguy-games-bot.herokuapp.com/api/discord/callback',
  scope: scopes,
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(403).send('not logged in :(');
}

app
  .use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index', { user: req.user }))
  .get('/commands', (req, res) => res.render('pages/commands', { commands }))
  .use('/api/discord/login', passport.authenticate('discord', { scope: scopes }))
  .get('/api/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/commands',
  }))
  .use('/api/discord/logout', (req, res) => {
    req.logout();
    res.redirect('/');
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
  });
  
io.on('connection', (socket) => {
  console.log('A user connected');
  socket
    .on('chat message', (msg) => {
      console.log(msg);
      socket.broadcast.emit('chat message', msg);
    })
    .on('disconnect', () => {
      console.log('A user disconnected')
    })
});

http.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
