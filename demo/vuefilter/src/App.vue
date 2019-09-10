<template>
  <div id="app">
    <date-format></date-format>
  </div>
</template>

<script>
import DateFormat from './components/DateFormat.vue'

export default {
  name: 'app',
  components: {
    DateFormat
  }
}
</script>

<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
