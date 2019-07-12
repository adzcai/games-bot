
/*
 * For an object that looks like this:
 *     foo: {
 *         bar: {
 *             aliases: []
 *         }
 *     }
 * this function defines all of bar's aliases on foo
 */
module.exports = (obj) => {
  Object.values(obj).forEach((val) => {
    if (val.aliases) {
      val.aliases.forEach(alias => Object.defineProperty(obj, alias, {
        get: () => val,
      }));
    }
  });
  return obj;
};
