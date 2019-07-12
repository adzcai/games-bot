const express = require('express');
const path = require('path');
const commands = require('./src/internal/getCommands');
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/commands', (req, res) => res.render('pages/commands', { commands }))
  .listen(PORT, () => console.log(`Listening on http://localhost:${ PORT }`));
