<template>
  <div id="app">
    <n-config-provider :theme="theme">
      <router-view />
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui'

const theme = darkTheme
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
