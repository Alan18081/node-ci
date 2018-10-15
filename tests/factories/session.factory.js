const { Buffer } = require('safe-buffer');
const { cookieKey } = require('../../config/keys');
const Keygrip = require('keygrip');
const keygrip = new Keygrip([cookieKey]);

module.exports = user => {
	const sessionObject = {
		passport: {
			user: user._id.toString()
		}
	};

	const session = Buffer.from(
		JSON.stringify(sessionObject)
	).toString('base64');

	const sig = keygrip.sign(`session=${session}`);

	return {
		session,
		sig
	}
};