module.exports = (obj) => {
	Object.values(obj).forEach(val => {
		if (val.aliases)
			val.aliases.forEach(alias => Object.defineProperty(obj, alias, { get: () => val }));
	});
};