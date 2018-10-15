const mongoose = require('mongoose');

module.exports = () => {
	const User = mongoose.model('User');
	return new User({}).save();
};