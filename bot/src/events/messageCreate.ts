import processQuote from "../lib/processQuote";
import { BotEvent } from "../types";
export default {
  name: "messageCreate",
  async execute(message) {
    // Listen for chat messages to be recorded as stats
    if (!message.author.bot) {
      message.client.db.addMessage(message.author.id, message.createdTimestamp);
    }

    // Listen for text messages in quote channel
    const quoteChannel = await message.client.keyv.get("quote_channel");
    if (message.channelId === quoteChannel) {
      const quotes = await message.client.db.getQuotes();
      processQuote(message, message.client, quotes);
    }
  },
} as BotEvent;
