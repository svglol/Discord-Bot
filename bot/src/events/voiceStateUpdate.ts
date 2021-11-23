import { BotEvent } from '../types';

const lastUsedIntroArray = [];
const lastUsedExitArray = [];

export default{
	name: 'voiceStateUpdate',
	async execute(oldMember, newMember, client) {

		//stats collection
		const newUserChannel = newMember.channel;
		const oldUserChannel = oldMember.channel;
		const afkChannel = newMember.guild.afkChannel;
		// User joins server
		if (
			(oldUserChannel === null && newUserChannel !== null) ||
			(oldUserChannel === afkChannel && newUserChannel !== null)
		) {
			if (newUserChannel !== afkChannel) {
				const date = new Date();
				const currentTime = date.getTime();
				client.db.updateUserLastConnection(newMember.id, currentTime);
			}
		} else if (newUserChannel === null || newUserChannel === afkChannel) {
			// User leaves server
			client.db.addUserConnection(newMember.id);
		}

		//intro/exit
		const cooldown = 300000;

		const channel = newMember.guild.channels.cache.find(ch => ch.name === 'general-chat');
		if (!channel) return;

		const user = newMember;
		const dbUser = await client.db.getUser(user.id);
		if (oldUserChannel === null && newUserChannel !== null) {
			// User Joins a voice channel
			if (dbUser != null) {
				if (dbUser.intro != null && dbUser.intro !== '') {
					const date = new Date();
					const currentTime = date.getTime();
					const lastUsedUser = { userid: user.id, usedTime: currentTime };

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
					const date = new Date();
					const currentTime = date.getTime();
					const lastUsedUser = { userid: user.id, usedTime: currentTime };

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
} as BotEvent;