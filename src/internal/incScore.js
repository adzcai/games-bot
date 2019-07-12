module.exports = (userID, serverID, score) => {
  const sql = `UPDATE players
    SET score = ${score}
    WHERE userID=${userID} AND serverID=${serverID}`;
  global.dbcomm.query(sql, (err) => {
    if (err) throw err;
    logger.info(`Score for ${bot.users.get(userID)} in server ${bot.guilds.get(serverID)} updated to ${score}`);
  });
};
