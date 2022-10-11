<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <EditorCk5 />
  </div>
</template>

<script>
import EditorCk5 from './components/EditorCk5.vue';

export default {
  name: 'App',
  components: {
    EditorCk5,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
