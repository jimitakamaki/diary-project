<template>
  <div id="app">
    <EntriesList />
  </div>
</template>

<script>
import EntriesList from "@/components/EntriesList";

export default {
  name: 'App',
  components: {
    EntriesList
  }
}
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
