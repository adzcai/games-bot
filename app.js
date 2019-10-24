require('dotenv').config();

const assert = require('assert');
const express = require('express');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const SocketIO = require('socket.io');

const MongoStore = require('connect-mongo')(session);

const routes = require('./server/routes');
const discordRoutes = require('./server/api/discord');
const authRoutes = require('./server/routes/auth');
const { checkAuth } = require('./server/middleware');
const asyncMiddleware = require('./server/asyncMiddleware');

require('./src/util/logger');
require('./src/util/exitHandler');
require('./bot');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.NODE_ENV === 'local' ? 'mongodb://localhost/gamesBot' : process.env.MONGODB_URI;
assert(typeof MONGODB_URI !== 'undefined', 'Did you put create MONGODB_URI as an environment variable?');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false });
mongoose.connection
  .on('error', logger.error.bind(logger, 'connection error:'))
  .once('open', () => {
    logger.info('connected to the database');
  });

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

app
  .use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
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

  .use(routes)
  .use('/api/discord', discordRoutes)
  .use(checkAuth)
  .use(authRoutes)

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

server.listen(PORT, () => logger.info(`Listening on http://localhost:${PORT}`));
