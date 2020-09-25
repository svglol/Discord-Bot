<template>
  <div class="card" style="width:100%">
    <header class="card-header" style="background-color:rgba(0,114,201,1)">
      <p class="card-header-title" style="color:white">
        Text Message Controller
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        <b-field label="Server">
          <b-select placeholder="Select a server" v-model="server">
            <option
            v-for="option in servers"
            :value="option.id"
            :key="option.id">
            {{ option.name }}
          </option>
        </b-select>
      </b-field>

      <b-field label="Text Channel">
        <b-select placeholder="Select a voice channel" v-model="channel">
          <option
          v-for="option in channels"
          :value="option.id"
          :key="option.id">
          {{ option.name }}
        </option>
      </b-select>
    </b-field>

    <b-field label="Message">
      <b-input v-model="message" type="textarea"></b-input>
    </b-field>

    <b-button icon-left="message" @click="sendMessage" type="is-success">
      Send Message
    </b-button>

  </div>
  <b-loading :active.sync="servers.length < 1" :is-full-page="false"></b-loading>
</div>
<footer class="card-footer">
  <b-button icon-left="cached" @click="clear" style="margin:1rem" type="is-danger">
    Clear Chat
</b-button>
</footer>
</div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      servers:[],
      channels:[],
      server: '',
      channel: '',
      message: '',
    }
  },
  mounted(){
    var ctx = this;
    axios.get('/api/discord/servers').then(result => {
      ctx.servers = result.data;
      ctx.server = ctx.servers[0].id;
    });

  },
  watch :{
    server: function(newVal){
      var ctx = this;
      //get voice channels
      axios.get('/api/discord/servers/'+newVal+'/textchannels').then(result => {
        ctx.channels = result.data;
        ctx.channel = ctx.channels[0].id;
      });
    }
  },
  methods:{
    sendMessage(){
      if(this.message && this.message !== ''){
        var ctx = this;
        axios.post('/api/bot',{
          message: ctx.message,
          server: ctx.server,
          channel: ctx.channel,
        }).then(result => {
          ctx.message = '';
          ctx.$buefy.toast.open({
            message: 'Message Sent',
            type: 'is-success'
          })
        });
      }
    },
    clear(){
      var ctx = this;
      axios.post('/api/bot',{
        clear: true,
        server: ctx.server,
        channel: ctx.channel,
      }).then(result => {
        ctx.message = '';
        ctx.$buefy.toast.open({
          message: 'Chat Cleared',
          type: 'is-success'
        })
      });
    }
  }
};

</script>

<style scoped>

</style>
