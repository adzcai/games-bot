exports.checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.status(403).render('pages/error', { code: 403, message: 'not logged in :(' });
};
