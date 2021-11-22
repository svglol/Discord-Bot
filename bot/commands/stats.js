const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Stats')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about user'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about server'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leaderboard')
				.setDescription('Server leaderboard')),

	async execute(interaction) {
		await interaction.deferReply();
		if (interaction.options._subcommand === 'user') {
			let user = await interaction.client.db.getUser(interaction.member.id);
			let users = await interaction.client.db.getUsers();

			let allEmbed = await generateUserAllEmbed(user, users, interaction);
			let yearEmbed = await generateUserYearEmbed(user, users, interaction);
			let monthEmbed = await generateUserMonthEmbed(user, users, interaction);
			let currentEmbed = allEmbed;

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('all')
						.setLabel('All-Time')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('year')
						.setLabel('Last Year')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('month')
						.setLabel('Last Month')
						.setStyle('SECONDARY')
				);

			const filter = i => (i.customId === 'all' || 'month' || 'year') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;

			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
			collector.on('collect', async i => {
				if (i.customId === 'all') {
					currentEmbed = allEmbed;
				}
				else if (i.customId === 'month') {
					currentEmbed = monthEmbed;
				}
				else if (i.customId === 'year') {
					currentEmbed = yearEmbed;
				}
				await i.update({ embeds: [currentEmbed], components: [row] });
			});

			collector.on('end', () => {
				interaction.editReply({ embeds: [currentEmbed], components: [] });
			});

			await interaction.editReply({ embeds: [currentEmbed], components: [row] });
		}
		else if (interaction.options._subcommand === 'server') {
			let users = await interaction.client.db.getUsers();

			let allEmbed = await generateServerAllEmbed(users, interaction);
			let yearEmbed = await generateServerYearEmbed(users, interaction);
			let monthEmbed = await generateServerMonthEmbed(users, interaction);
			let currentServerEmbed = allEmbed;

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('all')
						.setLabel('All-Time')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('year')
						.setLabel('Last Year')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('month')
						.setLabel('Last Month')
						.setStyle('SECONDARY')
				);

			const filter = i => (i.customId === 'all' || 'month' || 'year') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;

			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async i => {
				if (i.customId === 'all') {
					currentServerEmbed = allEmbed;
				}
				else if (i.customId === 'month') {
					currentServerEmbed = monthEmbed;
				}
				else if (i.customId === 'year') {
					currentServerEmbed = yearEmbed;
				}
				await i.update({ embeds: [currentServerEmbed], components: [row] });
			});

			collector.on('end', () => {
				interaction.editReply({ embeds: [currentServerEmbed], components: [] });
			});

			await interaction.editReply({ embeds: [currentServerEmbed], components: [row] });
		}
		else if (interaction.options._subcommand === 'leaderboard') {
			let currentLeaderboard = 'voice';
			let currentLeaderboardSort = 'all';
			let embedMap = new Map();

			let users = await interaction.client.db.getUsers();

			let users_30 = generateUsersData(await interaction.client.db.getUsers(), 30);
			let users_365 = generateUsersData(await interaction.client.db.getUsers(), 365);

			embedMap.set('voice', { all: generateLeaderboardEmbed('Voice All Time Leaderboard', users, interaction, 'voice'), year: generateLeaderboardEmbed('Voice Last 365 Days Leaderboard', users_365, interaction, 'voice'), month: generateLeaderboardEmbed('Voice Last 30 Days Leaderboard', users_30, interaction, 'voice') });
			embedMap.set('messages', { all: generateLeaderboardEmbed('Messages All Time Leaderboard', users, interaction, 'messages'), year: generateLeaderboardEmbed('Messages Last 365 Days Leaderboard', users_365, interaction, 'messages'), month: generateLeaderboardEmbed('Messages Last 30 Days Leaderboard', users_30, interaction, 'messages') });
			embedMap.set('sound', { all: generateLeaderboardEmbed('Soundboard All Time Leaderboard', users, interaction, 'sound'), year: generateLeaderboardEmbed('Soundboard Last 365 Days Leaderboard', users_365, interaction, 'sound'), month: generateLeaderboardEmbed('Soundboard Last 30 Days Leaderboard', users_30, interaction, 'sound') });

			var currentLeaderboardEmbed = embedMap.get(currentLeaderboard)[currentLeaderboardSort];

			const row2 = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('all')
						.setLabel('All-Time')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('year')
						.setLabel('Last Year')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('month')
						.setLabel('Last Month')
						.setStyle('SECONDARY'),
				);

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('voice')
						.setLabel('🗣️')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('messages')
						.setLabel('⌨️')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('sound')
						.setLabel('🔊')
						.setStyle('PRIMARY')
				);

			const filter = i => (i.customId === 'all' || 'month' || 'year' || 'voice' || 'messages' || 'sound') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;

			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async i => {
				if (i.customId === 'all') {
					currentLeaderboardSort = 'all';
				}
				else if (i.customId === 'month') {
					currentLeaderboardSort = 'month';
				}
				else if (i.customId === 'year') {
					currentLeaderboardSort = 'year';
				}
				else if (i.customId === 'voice') {
					currentLeaderboard = i.customId;
				}
				else if (i.customId === 'messages') {
					currentLeaderboard = i.customId;
				}
				else if (i.customId === 'sound') {
					currentLeaderboard = i.customId;
				}
				currentLeaderboardEmbed = embedMap.get(currentLeaderboard)[currentLeaderboardSort];
				await i.update({ embeds: [currentLeaderboardEmbed], components: [row, row2] });
			});

			collector.on('end', () => {
				interaction.editReply({ embeds: [currentLeaderboardEmbed], components: [] });
			});

			await interaction.editReply({ embeds: [currentLeaderboardEmbed], components: [row, row2] });
		}
	},
};

async function generateUserAllEmbed(user, users, interaction) {
	return generateUserEmbed('All Time Stats', user, users, interaction);
}

function generateUserData(_user, _users, days) {
	let users = _users;
	let time = new Date(new Date() - (1000 * 60 * 60 * 24 * days));
	users.forEach(element => {
		element.user_messages = element.user_messages.filter(item => (time.getTime() < item.date));
		element.user_soundboards = element.user_soundboards.filter(item => (time.getTime() < item.date));
		element.user_connections = element.user_connections.filter(item => (time.getTime() < item.disconnectTime));
	});
	let user = users.find(element => element.id === _user.id);

	return { user, users };
}

function generateUsersData(_users, days) {
	let users = _users;
	let time = new Date(new Date() - (1000 * 60 * 60 * 24 * days));
	users.forEach(element => {
		element.user_messages = element.user_messages.filter(item => (time.getTime() < item.date));
		element.user_soundboards = element.user_soundboards.filter(item => (time.getTime() < item.date));
		element.user_connections = element.user_connections.filter(item => (time.getTime() < item.disconnectTime));
	});

	return users;
}

async function generateUserMonthEmbed(_user, _users, interaction) {
	var { user, users } = generateUserData(_user, _users, 30);
	return generateUserEmbed('Last 30 Days Stats', user, users, interaction);
}


async function generateUserYearEmbed(_user, _users, interaction) {
	var { user, users } = generateUserData(_user, _users, 365);
	return generateUserEmbed('Last 365 Days Stats', user, users, interaction);
}

function generateServerEmbed(title, users, interaction) {
	var embed = new MessageEmbed()
		.setTitle(title)
		.setAuthor(interaction.guild.name)
		.setColor('#0099ff');

	var totalMessages = '';
	var totalConnection = '';
	var totalSoundboard = '';
	var mostUsedCommands = '';

	var messageNum = 0;
	var length = 0;
	var soundboard = 0;
	var usersSoundboardUsage = [];
	users.forEach(user => {
		messageNum += user.user_messages.length;
		user.user_connections.forEach(connection => { length += connection.connectionLength; });
		soundboard += user.user_soundboards.length;

		user.user_soundboards.forEach(userSoundboard => {
			var created = false;
			usersSoundboardUsage.forEach(used => {
				if (used.command === userSoundboard.command) {
					created = true;
					used.total++;
				}
			});
			if (!created) {
				usersSoundboardUsage.push({ command: userSoundboard.command, total: 1 });
			}
		});
	});
	totalMessages = String(messageNum);
	totalSoundboard = String(soundboard);
	totalConnection = parseMillisecondsIntoReadableTime(length);

	usersSoundboardUsage.sort(function (a, b) {
		if (a.total > b.total) {
			return -1;
		}
		if (a.total < b.total) {
			return 1;
		}
		return 0;
	});
	usersSoundboardUsage = usersSoundboardUsage.slice(0, 10);
	usersSoundboardUsage.forEach(element => {
		mostUsedCommands += ' `' + element.command + '`';
	});

	embed.addField('Connection Time', totalConnection);
	embed.addField('Messages', totalMessages);
	embed.addField('Soundboard Usage', totalSoundboard);
	embed.addField('Top 10 Soundboard Commands', mostUsedCommands);
	return embed;
}

function generateServerAllEmbed(users, interaction) {
	return generateServerEmbed('All Time Stats', users, interaction);
}

function generateServerMonthEmbed(_users, interaction) {
	let users = generateUsersData(_users, 30);
	return generateServerEmbed('Last 30 Days Stats', users, interaction);
}

function generateServerYearEmbed(_users, interaction) {
	let users = generateUsersData(_users, 365);
	return generateServerEmbed('Last 365 Days Stats', users, interaction);
}

function generateUserEmbed(title, user, users, interaction) {
	var embed = new MessageEmbed()
		.setTitle(title)
		.setAuthor(interaction.user.tag, interaction.user.avatarURL)
		.setColor('#0099ff');

	var totalMessages = String(user.user_messages.length);
	var totalConnection = '';
	var totalSoundboard = String(user.user_soundboards.length);
	var totalMessagesPos = '';
	var totalConnectionPos = '';
	var totalSoundboardPos = '';
	var mostUsedCommands = '';

	var length = 0;
	user.user_connections.forEach(connection => { length += connection.connectionLength; });
	totalConnection = parseMillisecondsIntoReadableTime(length);

	//messages rank
	var userMessageRanks = [];
	users.forEach(element => {
		userMessageRanks.push({ id: element.id, messages: element.user_messages.length });
	});
	userMessageRanks.sort(function (a, b) {
		if (a.messages > b.messages) {
			return -1;
		}
		if (a.messages < b.messages) {
			return 1;
		}
		return 0;
	});
	userMessageRanks.forEach((element, index) => {
		if (element.id === user.id) {
			totalMessagesPos = '#' + (index + 1);
		}
	});

	//connection rank
	var userConnectionRanks = [];
	users.forEach(element => {
		var total = 0;
		element.user_connections.forEach(connection => { total += connection.connectionLength; });
		userConnectionRanks.push({ id: element.id, total: total });
	});
	userConnectionRanks.sort(function (a, b) {
		if (a.total > b.total) {
			return -1;
		}
		if (a.total < b.total) {
			return 1;
		}
		return 0;
	});
	userConnectionRanks.forEach((element, index) => {
		if (element.id === user.id) {
			totalConnectionPos = '#' + (index + 1);
		}
	});

	//soundboard rank
	var userSoundboardRank = [];
	users.forEach(element => {
		userSoundboardRank.push({ id: element.id, uses: element.user_soundboards.length });
	});
	userSoundboardRank.sort(function (a, b) {
		if (a.uses > b.uses) {
			return -1;
		}
		if (a.uses < b.uses) {
			return 1;
		}
		return 0;
	});
	userSoundboardRank.forEach((element, index) => {
		if (element.id === user.id) {
			totalSoundboardPos = '#' + (index + 1);
		}
	});

	//most used sound commands
	var userSoundboardUsage = [];
	user.user_soundboards.forEach(userSoundboard => {
		var created = false;
		userSoundboardUsage.forEach(used => {
			if (used.command === userSoundboard.command) {
				created = true;
				used.total++;
			}
		});
		if (!created) {
			userSoundboardUsage.push({ command: userSoundboard.command, total: 1 });
		}
	});
	userSoundboardUsage.sort(function (a, b) {
		if (a.total > b.total) {
			return -1;
		}
		if (a.total < b.total) {
			return 1;
		}
		return 0;
	});
	userSoundboardUsage = userSoundboardUsage.slice(0, 5);
	userSoundboardUsage.forEach(element => {
		mostUsedCommands += ' `' + element.command + '`';
	});

	embed.addField('Pos', totalConnectionPos, true);
	embed.addField('Connection Time', totalConnection, true);
	embed.addField('\u200B', '\u200B', true);
	embed.addField('Pos', totalMessagesPos, true);
	embed.addField('Messages', totalMessages, true);
	embed.addField('\u200B', '\u200B', true);
	embed.addField('Pos', totalSoundboardPos, true);
	embed.addField('Soundboard Usage', totalSoundboard, true);
	embed.addField('\u200B', '\u200B', true);
	embed.addField('Top 5 Soundboard Commands', mostUsedCommands);
	return embed;
}

function parseMillisecondsIntoReadableTime(millisec) {
	var seconds = (millisec / 1000).toFixed(0);
	var minutes = Math.floor(seconds / 60);
	var hours = '';
	if (minutes > 59) {
		hours = Math.floor(minutes / 60);
		hours = hours >= 10 ? hours : '0' + hours;
		minutes = minutes - hours * 60;
		minutes = minutes >= 10 ? minutes : '0' + minutes;
	}

	seconds = Math.floor(seconds % 60);
	seconds = seconds >= 10 ? seconds : '0' + seconds;
	if (hours !== '') {
		return hours + ':' + minutes + ':' + seconds;
	}
	return minutes + ':' + seconds;
}

function generateLeaderboardEmbed(title, users, interaction, type) {
	let embed = new MessageEmbed()
		.setTitle(title)
		.setAuthor(interaction.guild.name)
		.setColor('#0099ff');

	let rows = [];
	switch (type) {
	case 'voice':
		rows.push(['#', 'Name', 'Time']);
		var voiceRanks = [];
		users.forEach(user => {
			var length = 0;
			user.user_connections.forEach(connection => { length += connection.connectionLength; });
			if (length !== 0) {
				voiceRanks.push({ id: user.id, total: length });
			}
		});

		voiceRanks.sort(function (a, b) {
			if (a.total > b.total) {
				return -1;
			}
			if (a.total < b.total) {
				return 1;
			}
			return 0;
		});

		voiceRanks = voiceRanks.splice(0, 10);

		voiceRanks.forEach((element, index) => {
			let user = interaction.client.users.cache.get(element.id);
			let username = '';
			if (user !== undefined) {
				username = user.username;
			}
			rows.push([(index + 1).toString(), username, parseMillisecondsIntoReadableTime(element.total)]);
		});
		break;
	case 'messages':
		rows.push(['#', 'Name', 'Messages']);
		var messageRanks = [];
		users.forEach(user => {
			if (user.user_messages.length !== 0) {
				messageRanks.push({ id: user.id, total: user.user_messages.length });
			}
		});

		messageRanks.sort(function (a, b) {
			if (a.total > b.total) {
				return -1;
			}
			if (a.total < b.total) {
				return 1;
			}
			return 0;
		});

		messageRanks = messageRanks.splice(0, 10);

		messageRanks.forEach((element, index) => {
			let user = interaction.client.users.cache.get(element.id);
			let username = '';
			if (user !== undefined) {
				username = user.username;
			}
			rows.push([(index + 1).toString(), username, element.total]);
		});

		break;
	case 'sound':
		rows.push(['#', 'Name', 'Uses']);
		var soundRanks = [];
		users.forEach(user => {
			if (user.user_soundboards.length !== 0) {
				soundRanks.push({ id: user.id, total: user.user_soundboards.length });
			}
		});

		soundRanks.sort(function (a, b) {
			if (a.total > b.total) {
				return -1;
			}
			if (a.total < b.total) {
				return 1;
			}
			return 0;
		});

		soundRanks = soundRanks.splice(0, 10);

		soundRanks.forEach(async (element, index) => {
			let user = interaction.client.users.cache.get(element.id);
			let username = '';
			if (user !== undefined) {
				username = user.username;
			}
			rows.push([(index + 1).toString(), username, element.total]);
		});
		break;
	}
	embed.setDescription(generateTable(rows));

	return embed;

}

function generateTable(rows) {
	var tableString = '```';
	const spacing = 2;

	var colLength = new Map();
	// get longest word in each column
	rows.forEach((row) => {
		row.forEach((line, i) => {
			if (line != null) {
				if (!colLength.get(i)) {
					colLength.set(i, line.length);
				}
				if (line.length > colLength.get(i)) {
					colLength.set(i, line.length);
				}
			}
		});
	});

	// add spacing to max length of each column
	for (const [key, value] of colLength.entries()) {
		colLength.set(key, value + spacing);
	}

	// generate the tableString
	rows.forEach((row) => {
		row.forEach((line, i) => {
			if (line != null) {
				var text = line;
				var space = '';
				for (var j = 0; j < colLength.get(i) - text.length; j++) {
					space += ' ';
				}
				tableString += text;
				tableString += space;
			}
		});
		tableString += '\n';
	});

	tableString += '```';
	return tableString;
}