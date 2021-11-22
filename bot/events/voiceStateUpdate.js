
var lastUsedIntroArray = [];
var lastUsedExitArray = [];

module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldMember, newMember, client) {

		//stats collection
		let newUserChannel = newMember.channel;
		let oldUserChannel = oldMember.channel;
		let afkChannel = newMember.guild.afkChannel;
		// User joins server
		if (
			(oldUserChannel === null && newUserChannel !== null) ||
			(oldUserChannel === afkChannel && newUserChannel !== null)
		) {
			if (newUserChannel !== afkChannel) {
				var date = new Date();
				var currentTime = date.getTime();
				client.db.updateUserLastConnection(newMember.id, currentTime);
			}
		} else if (newUserChannel === null || newUserChannel === afkChannel) {
			// User leaves server
			client.db.addUserConnection(newMember.id);
		}

		//intro/exit
		const cooldown = 300000;

		let channel = newMember.guild.channels.cache.find(ch => ch.name === 'general-chat');
		if (!channel) return;

		var user = newMember;
		var dbUser = await client.db.getUser(user.id);
		if (oldUserChannel === null && newUserChannel !== null) {
			// User Joins a voice channel
			if (dbUser != null) {
				if (dbUser.intro != null && dbUser.intro !== '') {
					let date = new Date();
					let currentTime = date.getTime();
					let lastUsedUser = { userid: user.id, usedTime: currentTime };

					// check if there is already an entry
					if (lastUsedIntroArray.some(lastUser => lastUser.userid === user.id)) {
						// get the lastUser object
						let index;
						lastUsedIntroArray.some(function (entry, i) {
							if (entry.userid === user.id) {
								index = i;
								return true;
							}
						});

						// check if the cooldown time has passed
						if (currentTime > lastUsedIntroArray[index].usedTime + cooldown) {
							// post gif and update entry in array
							channel.send(dbUser.intro);
							lastUsedIntroArray[index].usedTime = currentTime;
						}
					} else {
						// post gif
						channel.send(dbUser.intro);
						// add entry to lastUsedIntroArray
						lastUsedIntroArray.push(lastUsedUser);
					}
				}
			}
		} else if (newUserChannel === null) {
			// User leaves a voice channel
			if (dbUser != null) {
				if (dbUser.exit != null && dbUser.exit !== '') {
					let date = new Date();
					let currentTime = date.getTime();
					let lastUsedUser = { userid: user.id, usedTime: currentTime };

					// check if there is already an entry
					if (lastUsedExitArray.some(lastUser => lastUser.userid === user.id)) {
						// get the lastUser object
						let index;
						lastUsedExitArray.some(function (entry, i) {
							if (entry.userid === user.id) {
								index = i;
								return true;
							}
						});

						// check if the cooldown time has passed
						if (currentTime > lastUsedExitArray[index].usedTime + cooldown) {
							// post gif and update entry in array
							channel.send(dbUser.exit);
							lastUsedExitArray[index].usedTime = currentTime;
						}
					} else {
						// post gif
						channel.send(dbUser.exit);
						// add entry to lastUsedExitArray
						lastUsedExitArray.push(lastUsedUser);
					}
				}
			}
		}
	},
};