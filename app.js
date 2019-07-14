require('dotenv').config();

const assert = require('assert');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

require('./src/util/logger');
require('./src/util/exitHandler');
require('./bot');

const asyncMiddleware = require('./server/asyncMiddleware');

const PORT = process.env.PORT || 5000;
const { MONGODB_URI } = process.env;
assert(typeof MONGODB_URI !== 'undefined', 'Did you put create MONGODB_URI as an environment variable?');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection
  .on('error', logger.error.bind(logger, 'connection error:'))
  .once('open', () => {
    logger.info('connected to the database');
  });

const app = express();
/* eslint-disable import/order */
const http = require('http').createServer(app);
const io = require('socket.io')(http);
/* eslint-enable import/order */

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.status(403).render('pages/error', { code: 403, message: 'not logged in :(' });
}

app
  .use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
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
  .get('/commands', (req, res) => res.render('pages/commands'))
  .use('/api/discord', require('./server/api/discord'))
  .use('/games', checkAuth, require('./server/routes/games'))
  .use((req, res) => {
    res.status(404).render('pages/error', { code: 404, message: 'The page you were looking for does not exist' });
  })
  .use((err, req, res) => res.status(err.message === 'NoCodeProvided' ? 400 : 500).send({
    status: 'ERROR',
    error: err.message,
  }));

io.on('connection', (socket) => {
  logger.info(`User ${socket.id} connected`);
  fs.readdirSync('./server/socketEvents').forEach((fname) => {
    if (!fname.endsWith('.js')) return;
    const eventName = fname.slice(0, -3);
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const cmd = require(`./server/socketEvents/${eventName}`);
      socket.on(eventName, cmd.bind(null, socket));
    } catch (e) {
      logger.error(`Error reading event ${eventName}: `, e);
    }
  });
});

http.listen(PORT, () => logger.info(`Listening on http://localhost:${PORT}`));
