<template>
  <div class="modal-card">
    <header class="modal-card-head" >
      <p class="modal-card-title" v-if="id == 0">Add new gif command</p>
      <p class="modal-card-title" v-if="id !== 0">Update gif command</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Command">
        <b-input v-model="vCommand" required validation-message="Command required"  ref="command"></b-input>
      </b-field>
      <b-field label="Link">
        <b-input v-model="vLink" required validation-message="Link required" ref="link"></b-input>
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

export default {
  props: ['id', 'command', 'link'],
  data() {
    return {
      vCommand:this.command,
      vLink:this.link
    }
  },
  watch: {
    command: function(newVal, oldVal) { // watch it
     this.vCommand = newVal;
   },
   link: function(newVal, oldVal) {
     this.vLink = newVal;
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
      return true;
    }
  }
}

</script>

<style scoped>

</style>
