const processQuote = require('../lib/processQuote');
module.exports = {
	name: 'messageCreate',
	async execute(message) {
		//Listen for chat messages to be recorded as stats
		if (!message.author.bot) {
			message.client.db.addMessage(message.author.id, message.createdTimestamp);
		}

		//Listen for text messages in quote channel
		let quote_channel = await message.client.keyv.get('quote_channel');
		if(message.channelId === quote_channel){
			let quotes = await message.client.db.getQuotes();
			processQuote(message, message.client,quotes);
		}
	},
};