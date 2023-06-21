<template>
  <v-app :theme="customizeTheme.darkTheme ? 'dark' : 'light'">
    <!-- <component :is="currentLayout" v-if="isRouterLoaded">
      <router-view> </router-view>
    </component> -->
    <CustomizationMenu />
    <BackToTop />
  </v-app>
</template>

<script setup lang="ts">
// import { computed } from "vue";
// import { useRoute } from "vue-router";
// import DefaultLayout from "@/layouts/DefaultLayout.vue";
// import LandingLayout from "@/layouts/LandingLayout.vue";
import CustomizationMenu from "@/components/CustomizationMenu.vue";
import BackToTop from "@/components/common/BackToTop.vue";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";

const customizeTheme = useCustomizeThemeStore();

// const route = useRoute();

// const isRouterLoaded = computed(() => {
//   if (route.name !== null) return true;
//   return false;
// });

// const layouts = {
//   default: DefaultLayout,
//   // ui: UILayout,
//   landing: LandingLayout,
//   // auth: AuthLayout,
// };

// type LayoutName = "default" | "ui" | "landing" | "auth" | "error";
// type LayoutName = "default" | "landing";

// const currentLayout = computed(() => {
//   const layoutName = route.meta.layout as LayoutName;
//   if (!layoutName) {
//     return DefaultLayout;
//   }
//   return layouts[layoutName];
// });
</script>

<style scoped>
</style>
