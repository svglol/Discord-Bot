module.exports = {
  name: 'backupdb',
  description: 'send a dm to admin with the database',
  adminOnly:true,
  guildOnly: true,
  execute(message, args,client) {
    message.delete().catch(err => console.log(err));
    message.author.send(new Date().toISOString(), {
      files: [
        "./database.sqlite"
      ]
    });
  },
};
