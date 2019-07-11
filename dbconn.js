// A MySQL connection to keep track of user scores and pretty much nothing else

const { createConnection } = require('mysql');

module.exports.initTable = initTable;
module.exports.initPlayer = initPlayer;

const dbconn = createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS,
  database: 'gamesbot',
});

global.dbconn = dbconn;
dbconn.connect((err) => {
  if (err) throw err;
  global.logger.info('Connected to database');
});

function initTable(guildID) {
  // Makes sure each server and its players are correctly stored in the database
  const sql = `CREATE TABLE IF NOT EXISTS \`${guildID}\` (
    playerID VARCHAR(20) PRIMARY KEY,
    score INT DEFAULT 0 
  )`;
  global.dbconn.query(sql, (err) => {
    if (err) throw err;
    global.logger.info(`Table for server with ID ${guildID} successfully created`);
  });
}

function initPlayer(guildID, playerID) {
  const sql = `INSERT IGNORE INTO \`${guildID}\` (playerID, score) VALUES ('${playerID}', 0)`;
  global.dbconn.query(sql, (err) => {
    if (err) throw err;
    global.logger.info(`${global.bot.users.get(playerID)} successfully added to table`);
  });
}
