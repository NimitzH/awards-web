module.exports = require('polka')()
	.use('/category', require('./category-api'))
	.use('/themes', require('./theme-api'))
	.use('/user', require('./user-api'))
	.use('/votes', require('./vote-api'))
	.use('/locks', require('./lock-api'))
	.use('/complain', require('./complain'))
	.use('/juror-apps', require('./application-api'))
	.use('/final', require('./finalVote-api'));
