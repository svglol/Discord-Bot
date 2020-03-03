var lastUsedIntroArray = new Array();
var lastUsedExitArray = new Array();

const cooldown = require('../config.json').cooldown;

module.exports = {
  listen:function(client){
    client.on('voiceStateUpdate', (oldMember, newMember) => {
      let newUserChannel = newMember.channel;
      let oldUserChannel = oldMember.channel;

      var channel = newMember.guild.channels.cache.find(ch => ch.name === 'general-chat');
      if (!channel) return;

      if(oldUserChannel === null && newUserChannel !== null) {
        // User Joins a voice channel
        var user = newMember;

        var dbUser = client.getDbHelper().getUsers().get(user.id);
        if(dbUser.intro != null){
          var date = new Date();
          var currentTime = date.getTime();
          var lastUsedUser = {userid:user.id, usedTime:currentTime};

          //check if there is already an entry
          if(lastUsedIntroArray.some(lastUser => lastUser.userid === user.id)){
            //get the lastUser object
            var index;
            lastUsedIntroArray.some(function(entry, i) {
              if (entry.userid === user.id) {
                index = i;
                return true;
              }
            });

            //check if the cooldown time has passed
            if(currentTime > lastUsedIntroArray[index].usedTime + cooldown){
              //post gif and update entry in array
              channel.send(dbUser.intro);
              lastUsedIntroArray[index].usedTime = currentTime;
            }
          } else{
            //post gif
            channel.send(dbUser.intro);
            //add entry to lastUsedIntroArray
            lastUsedIntroArray.push(lastUsedUser);
          }
        }

      } else if(newUserChannel === null){
        // User leaves a voice channel
        var user = newMember;
        var dbUser = client.getDbHelper().getUsers().get(user.id);
        if(dbUser.exit != null){
          var date = new Date();
          var currentTime = date.getTime();
          var lastUsedUser = {userid:user.id, usedTime:currentTime};

          //check if there is already an entry
          if(lastUsedExitArray.some(lastUser => lastUser.userid === user.id)){
            //get the lastUser object
            var index;
            lastUsedExitArray.some(function(entry, i) {
              if (entry.userid === user.id) {
                index = i;
                return true;
              }
            });

            //check if the cooldown time has passed
            if(currentTime > lastUsedExitArray[index].usedTime + cooldown){
              //post gif and update entry in array
              channel.send(dbUser.exit);
              lastUsedExitArray[index].usedTime = currentTime;
            }
          } else{
            //post gif
            channel.send(dbUser.exit);
            //add entry to lastUsedExitArray
            lastUsedExitArray.push(lastUsedUser);
          }
        }
      }
    });
  }
}
