import { BotEvent } from "../types";
export default {
  name: "guildMemberAdd",
  execute(member) {
    member.client.db.addUser(member.id);
  },
} as BotEvent;
