import { BotEvent } from '../types';
export default{
	name: 'messageDelete',
	async execute(message) {
		//Listen for quote deletion
		const quote_channel = await message.client.keyv.get('quote_channel');
		if (message.channelId === quote_channel) {
			const quotes = await message.client.db.getQuotes();
			quotes.forEach(async (quote) => {
				if (quote.messageId === message.id) {
					//delete matching quote from db
					await quote.destroy();
				}
			});
		}
	},
} as BotEvent;