<template>
  <div id="app">
    <css-scope></css-scope>
  </div>
</template>

<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display:flex;
  &>div{
    border:solid 1px #eee;
    margin:10px;
    padding:15px;
  }
}
</style>

<script>
import CssScope from './components/CssScope.vue'

export default {
  name: 'app',
  components: {
    CssScope
  }
}
</script>

