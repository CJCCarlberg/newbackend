<template>
  <div id="app">
    <img id="dvlogo" alt="dataViz logo" src="./assets/logo_dataviz_1.png">
    <HelloWorld msg="dataViz"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#dvlogo{
  width: 40%;
  height: auto;
}
</style>
