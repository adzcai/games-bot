require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

require('./src/util/logger');
require('./bot');
require('./src/util/exitHandler');

const asyncMiddleware = require('./src/util/asyncMiddleware');
const commands = require('./src/util/getCommands');

const PORT = process.env.PORT || 5000;

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
  .use(asyncMiddleware(async (req, res, next) => {
    if (req.user) req.user.user = await bot.fetchUser(req.user.id);
    res.locals.user = req.user;
    res.locals.bot = bot;
    next();
  }))
  .get('/', (req, res) => res.render('pages/index'))
  .get('/commands', (req, res) => res.render('pages/commands', { commands }))
  .use('/api/discord', require('./src/server/api/discord'))
  .use((req, res, next) => {
    res.status(404).render('pages/404');
  })
  .use((err, req, res, next) => res.status(err.message === 'NoCodeProvided' ? 400 : 500).send({
    status: 'ERROR',
    error: err.message,
  }));

io.on('connection', (socket) => {
  console.log('A user connected');
  socket
    .on('chat message', (msg) => {
      console.log(msg);
      socket.broadcast.emit('chat message', msg);
    })
    .on('disconnect', () => {
      console.log('A user disconnected');
    });
});

http.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
