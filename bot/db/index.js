var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var db = {};

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: '../resources/database.sqlite',
});

fs
	.readdirSync(__dirname + '/models/')
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		var model = require(path.join(__dirname + '/models/', file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.sync();

db.getUser = async function (id) {
	const user_ = await db.user.findByPk(id, {
		include: [
			{
				model: db.user_message,
				as: 'user_messages',
				separate: true,
			},
			{
				model: db.user_connection,
				as: 'user_connections',
				separate: true,
			},
			{
				model: db.user_soundboard,
				as: 'user_soundboards',
				separate: true,
			},
			{
				model: db.user_quote,
				as: 'user_quotes',
				separate: true,
			},
		]
	});
	return user_;
};

db.getUsers = async function () {
	const users = await db.user.findAll({
		include: [
			{
				model: db.user_message,
				as: 'user_messages',
				separate: true,
			},
			{
				model: db.user_connection,
				as: 'user_connections',
				separate: true,
			},
			{
				model: db.user_soundboard,
				as: 'user_soundboards',
				separate: true,
			},
			{
				model: db.user_quote,
				as: 'user_quotes',
				separate: true,
			},
		]
	});
	return users;
};

db.addUser = async function (id) {
	var user_ = await db.user.findByPk(id);
	if (!user_) {
		user_ = await db.user.create({ id: id });
	}
};

db.addMessage = async function (id, date) {
	var user_ = await db.user.findByPk(id);
	if (!user_) {
		user_ = await db.addUser(id);
	}
	await db.user_message.create({ userId: id, date: date });
};

db.updateUserLastConnection = async function (id, lastConnection) {
	var user_ = await db.user.findByPk(id);
	if (user_ != null) {
		user_.lastConnection = lastConnection;
		await user_.save();
	} else {
		await db.user.create({ id: id, lastConnection: lastConnection });
	}
};

db.addUserConnection = async function (id) {
	var user_ = await db.user.findByPk(id);
	if (!user_) {
		user_ = await db.addUser(id);
	}
	var date = new Date();
	var lastConnection = user_.lastConnection;
	await db.updateUserLastConnection(id, 0);
	if (lastConnection !== 0) {
		await db.user_connection.create({
			userId: id,
			connectTime: lastConnection,
			disconnectTime: date.getTime(),
			connectionLength: date.getTime() - lastConnection
		});
	}
};

db.getSoundCommands = async function () {
	return await db.sound_commands.findAll();
};

db.getSoundCommand = async function (commandName) {
	return await db.sound_commands.findOne({ where: { command: commandName } });
};

db.addUserSoundboard = async function (id, command, date) {
	var user_ = await db.user.findByPk(id);
	if (!user_) {
		user_ = await db.addUser(id);
	}
	await db.user_soundboard.create({ userId: id, command, date });
};

db.getTopSoundCommands = async function getTopSoundCommands() {
	let soundboardUsage = await db.user_soundboard.findAll();

	let top = [];
	for (const userSoundboard of soundboardUsage) {
		var update = top.find(data => data.command === userSoundboard.command);
		if (update != null) {
			update.uses += 1;
		} else {
			top.push({ command: userSoundboard.command, uses: 1 });
		}
	}

	top.sort(function (a, b) {
		if (a.uses > b.uses) {
			return -1;
		}
		if (a.uses < b.uses) {
			return 1;
		}
		return 0;
	});
	top.length = 25;
	return top;
};

db.getTextCommands = async function () {
	return await db.text_commands.findAll();
};

db.getTextCommand = async function (commandName) {
	return await db.text_commands.findOne({ where: { command: commandName } });
};

db.getQuotes = async function (){
	return await db.user_quote.findAll();
};

db.getQuote = async function (id) {
	return await db.user_quote.findOne({ where: { id: id } });
};

db.addQuote = async function (id, quote, date, messageId){
	var user_ = await db.user.findByPk(id);
	if (!user_) {
		user_ = await db.addUser(id);
	}
	return await db.user_quote.create({ userId: id, quote, date, messageId });
};


module.exports = db;
