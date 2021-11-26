import { SlashCommandBuilder } from "@discordjs/builders";
import { BotCommand } from "../types";
export default {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset the bot")
    .setDefaultPermission(false),
  async execute(interaction) {
    await interaction.deferReply();
    await interaction.deleteReply();
    console.log("Resetting the bot");
    process.exit(0);
  },
  adminOnly: true,
} as BotCommand;
