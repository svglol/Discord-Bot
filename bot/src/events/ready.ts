import { BotEvent } from "../types";
export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.db.getUsers().then((users) => {
      users.forEach((user) => {
        if (user.username === null) {
          client.users.fetch(user.id).then((cUser) => {
            user.username = cUser.username;
            user.save();
          });
        }
      });
    });
  },
} as BotEvent;
