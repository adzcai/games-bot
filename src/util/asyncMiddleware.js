/**
 * @callback asyncCallback
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */

/**
 * @param {asyncCallback} fn 
 */
function asyncMiddleware(fn) {
  function middleware(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  return middleware;
};

module.exports = asyncMiddleware;
