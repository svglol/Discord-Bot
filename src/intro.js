var lastUsedIntroArray = new Array();
var lastUsedExitArray = new Array();

module.exports = {
  listen:function(client,intros,exits,cooldown){
    client.on('voiceStateUpdate', (oldMember, newMember) => {
      let newUserChannel = newMember.channel;
      let oldUserChannel = oldMember.channel;

      var channel = newMember.guild.channels.find(ch => ch.name === 'general-chat');
      if (!channel) return;

      if(oldUserChannel === null && newUserChannel !== null) {
        // User Joins a voice channel
        var user = newMember;
        intros.forEach(obj => {
          if(user.id == obj.userid){
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
                channel.send(obj.link);
                lastUsedIntroArray[index].usedTime = currentTime;
              }
            } else{
              //post gif
              channel.send(obj.link);
              //add entry to lastUsedIntroArray
              lastUsedIntroArray.push(lastUsedUser);
            }
          }
        });

      } else if(newUserChannel === null){
        // User leaves a voice channel
        var user = newMember;
        exits.forEach(obj => {
          if(user.id == obj.userid){
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
                channel.send(obj.link);
                lastUsedExitArray[index].usedTime = currentTime;
              }
            } else{
              //post gif
              channel.send(obj.link);
              //add entry to lastUsedExitArray
              lastUsedExitArray.push(lastUsedUser);
            }
          }
        });
      }
    });
  }
}
