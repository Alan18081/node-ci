const mongoose = require('mongoose');
const Redis = require('ioredis');
const { redisUrl } = require('../config/keys');
const client = new Redis(redisUrl);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');

	return this;
};

mongoose.Query.prototype.exec = async function () {
	if(!this.useCache) {
		return exec.apply(this, arguments);
	}


	const queryKey = JSON.stringify({
		...this.getQuery(),
		collection: this.collection.name
	});

	const cacheValue = await client.hget(this.hashKey, queryKey);

	if(cacheValue) {
		const data = JSON.parse(cacheValue);

		return Array.isArray(data)
			? data.map(doc => new this.model(doc))
			: new this.model(data);

	}

	const result = exec.apply(this, arguments);
	client.hset(this.hashKey, queryKey, JSON.stringify(result), 'EX', 1);

	return result;
};

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	}
};