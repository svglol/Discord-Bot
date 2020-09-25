<template>
  <div class="modal-card">
    <header class="modal-card-head" >
      <p class="modal-card-title" v-if="id == 0">Add New Text Command</p>
      <p class="modal-card-title" v-if="id !== 0">Update Text Command</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Command">
        <b-input v-model="vCommand" required validation-message="Command required" ref="command"></b-input>
        <p class="help is-danger" v-if="!validCommand">Command name is already taken</p>
      </b-field>
      <b-field label="Text">
        <b-input v-model="vLink" required validation-message="Text required" ref="link"></b-input>
      </b-field>
    </section>

    <footer class="modal-card-foot" style="justify-content: flex-end;">
      <button class="button" type="button" @click="$emit('close');$refs.command.setValidity(true);$refs.link.setValidity(true)">Close</button>
      <button class="button is-primary" @click="updateCommand" v-if="id !== 0" >Update</button>
      <button class="button is-primary" @click="addCommand" v-if="id == 0">Add</button>
    </footer>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  props: ['id', 'command', 'link'],
  data() {
    return {
      vCommand:this.command,
      vLink:this.link,
      validCommand: true
    }
  },
  watch: {
    command: function(newVal, oldVal) { // watch it
      this.vCommand = newVal;
    },
    link: function(newVal, oldVal) {
      this.vLink = newVal;
    },
    vCommand: function(newVal){
      let ctx = this;
      if(newVal !== ''){
        axios.get('/api/discord/command/'+newVal, {
          command: newVal,
        })
        .then(function (response) {
          if(response.data === "OK"){
            ctx.validCommand = true;
            $refs.command.setValidity(true);
          }else{
            ctx.validCommand = false;
            $refs.command.setValidity(false);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      }else{
        ctx.validCommand = true;
        ctx.$refs.command.setValidity(true);
      }
    }
  },
  mounted(){

  },
  methods:{
    updateCommand(){
      if(this.valid()){
        this.$emit('update',{id:this.id,command:this.vCommand,link:this.vLink});
      }
    },
    addCommand(){
      if(this.valid()){
        this.$emit('add',{id:this.id,command:this.vCommand,link:this.vLink});
      }
    },
    valid(){
      this.$refs.command.checkHtml5Validity();
      this.$refs.link.checkHtml5Validity();
      if(this.vCommand === '')return false;
      if(this.vLink === '')return false;
      if(this.validCommand === false) return false;
      return true;
    }
  }
}

</script>

<style scoped>

</style>
