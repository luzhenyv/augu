<template>
  <div class="back-to-top" :class="{ visible: isVisible }" @click="scrollToTop">
    <Icon class="text-white" width="30" icon="ph:rocket-light"/>
  </div>
</template>
<script setup lang="ts">
  import { Icon } from '@iconify/vue';
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const isVisible = ref(false);

  const handleScroll = () => {
    isVisible.value = window.scrollY > 100;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  background-color: #705cf6;
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s ease;
  bottom: 50px;
  right: 5px;
  z-index: 999;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 1px 1px 9px #705cf6;
  cursor: pointer;
  &:hover {
    border-radius: 1rem;
    box-shadow: 1px 1px 18px #705cf6;
  }
  &.visible {
    opacity: 1;
    visibility: visible;
  }
}

</style>
