<template>
  <div class="particle-view">
    <ParticleScene />
  </div>
</template>

<script setup lang="ts">
import ParticleScene from '@/components/ParticleScene/ParticleScene.vue'
</script>

<style scoped>
.particle-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 