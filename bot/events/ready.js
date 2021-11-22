const SoundManager = require('../lib/soundManager');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		client.soundManager = new SoundManager(client);
		client.db.getUsers().then(users => {
			users.forEach(user => {
				if(user.username === null){
					client.users.fetch(user.id).then(cUser => {
						user.username = cUser.username;
						user.save();
					});
				}
			});
		});
	},
};