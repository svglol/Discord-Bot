import processQuote from "../lib/processQuote";
import { BotEvent } from "../types";

export default {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    // Listen for quote update
    const quoteChannel = await newMessage.client.keyv.get("quote_channel");
    if (newMessage.channelId === quoteChannel) {
      let quotes = await newMessage.client.db.getQuotes();
      quotes.forEach(async (quote) => {
        if (quote.messageId === newMessage.id) {
          // delete matching quote from db
          await quote.destroy();
          // create new entry
          quotes = await newMessage.client.db.getQuotes();
          processQuote(newMessage, newMessage.client, quotes);
        }
      });
    }
  },
} as BotEvent;
