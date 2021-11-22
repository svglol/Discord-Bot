const processQuote = require('../lib/processQuote');

module.exports = {
	name: 'messageUpdate',
	async execute(oldMessage, newMessage) {
		//Listen for quote update
		let quote_channel = await newMessage.client.keyv.get('quote_channel');
		if (newMessage.channelId === quote_channel) {
			let quotes = await newMessage.client.db.getQuotes();
			quotes.forEach(async (quote) => {
				if (quote.messageId === newMessage.id) {
					//delete matching quote from db
					await quote.destroy();
					//create new entry
					quotes = await newMessage.client.db.getQuotes();
					processQuote(newMessage, newMessage.client,quotes);
				}
			});
		}
	},
};