const https = require('https');
const fs = require('fs');

module.exports = {
  name: 'replacedb',
  description: 'replace the current db with one submitted -- USE WITH EXTREME CARE',
  meOnly: true,
  async execute (message, args, client) {
    if (message.attachments.size > 0) {
      for (const [key, attachment] of message.attachments.entries()) {
        var x = /^[^.]+.sqlite$/;
        if (x.test(attachment.name)) {
          // fs.renameSync("database.sqlite", "database-"+new Date().toTimeString()+".sqlite");
          const file = fs.createWriteStream('database.sqlite');
          https.get(attachment.url, async function (response) {
            await response.pipe(file);
            client.logger.log('info', 'Database Replaced');
          });
        } else {
          message.reply('File does not have the correct extension');
        }
      }
    }
  }
};
