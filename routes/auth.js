const log = require('another-logger');
const superagent = require('superagent');
const authApp = require('polka')();
const config = require('../config');
const r = require('../util/db');

function query (obj) {
	return Object.keys(obj)
		.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
		.join('&');
}


authApp.get('/reddit', (request, response) => {
	const queryString = query({
		client_id: config.reddit.clientId,
		response_type: 'code',
		state: 'test state', // TODO
		redirect_uri: `${config.host}/auth/reddit/callback`,
		duration: 'permanent',
		scope: 'identity',
	});
	response.redirect(`https://reddit.com/api/v1/authorize?${queryString}`);
});
authApp.get('/reddit/callback', async (request, response) => {
	const {error, state, code} = request.query;
	if (error) return response.end(error);
	if (state !== 'test state') return response.end('Invalid state');
	const data = await superagent.post('https://www.reddit.com/api/v1/access_token')
		.auth(config.reddit.clientId, config.reddit.clientSecret)
		.query({
			grant_type: 'authorization_code',
			code,
			redirect_uri: `${config.host}/auth/reddit/callback`,
		})
		.then(tokenResponse => tokenResponse.body);
	if (data.error) return response.end(data.error);
	request.session.redditAccessToken = data.access_token;
	request.session.redditRefreshToken = data.refresh_token;

	// Now that we stored the tokens, we need to see who we are and if we're
	// already in the database or not
	const {name} = await request.reddit().get('/me')
		.then(redditResponse => redditResponse.body);
	log.info(name);
	const users = await r.table('users').filter({reddit: name}).run();
	if (!users.length) {
		r.table('users').insert({
			reddit: name,
			discord: null,
			level: 0,
			lastLogin: Date.now(),
		}).run();
	} else if (users.length > 1) {
		return response.end(`You have a very bad problem. There's more than one account in the database with the Reddit account ${name} registered.`);
	} else {
		r.table('users').filter({reddit: name}).update({
			lastLogin: Date.now(),
		}).run();
	}
	response.redirect('/');
});
// debug stuff
authApp.get('/reddit/debug', (request, response) => {
	request.session.redditAccessToken = null;
	response.end('Yeeted');
});

// Deletes session
authApp.get('/logout', (request, response) => {
	request.session.destroy(() => {
		response.redirect('/');
	});
});

module.exports = authApp;
