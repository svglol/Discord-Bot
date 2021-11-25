import processQuote from'../lib/processQuote';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from '../types';

let client;
export default{
	data: new SlashCommandBuilder()
		.setName('importquotes')
		.setDescription('Import quotes from current channel & bind this channel to listen for new quotes')
		.setDefaultPermission(false),
	async execute(interaction) {
		await interaction.deferReply();

		//save this channel id to listen for new quotes
		await client.keyv.set('quote_channel', interaction.channelId);

		//fetch all messages from current channel
		let messages = [];
		let lastID;
		let fetch = true;
		while (fetch) {
			const fetchedMessages = await interaction.channel.messages.fetch({
				limit: 100,
				...(lastID && { before: lastID }),
			});
			if (fetchedMessages.size === 0) {
				fetch = false;
			}
			else {
				messages = messages.concat(Array.from(fetchedMessages.values()));
				lastID = fetchedMessages.lastKey();
			}
		}

		const quotes = await client.db.getQuotes();
		//process messages
		messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
		messages.forEach(async (message) => {
			await processQuote(message, client, quotes);
		});

		await interaction.deleteReply();
	},
	needsClient: true,
	async setClient(client_) {
		client = client_;
	},
	adminOnly: true
}  as BotCommand;

