import { BotEvent } from "../types";
export default {
  name: "messageDelete",
  async execute(message) {
    // Listen for quote deletion
    const quoteChannel = await message.client.keyv.get("quote_channel");
    if (message.channelId === quoteChannel) {
      const quotes = await message.client.db.getQuotes();
      quotes.forEach(async (quote) => {
        if (quote.messageId === message.id) {
          // delete matching quote from db
          await quote.destroy();
        }
      });
    }
  },
} as BotEvent;
