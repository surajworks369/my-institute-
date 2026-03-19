<template>
  <!-- Root outlet: router नुसार current page इथे render होते -->
  <router-view />
</template>

<script setup lang="ts">
/**
 * `App.vue` (Root Component Shell)
 *
 * - **कशासाठी**: पूर्ण app साठी root container म्हणून काम करणे.
 * - **Project मधली role**: Router चा main outlet (`<router-view />`) provide करते.
 * - **Logic प्रकार**: सध्या minimal shell; पुढे global layout control / providers इथे येऊ शकतात.
 * - **File प्रकार**: frontend (root component)
 */

// सध्या इथे business logic नाही; routes बदलल्यावर pages/layouts स्वतः render होतात
</script>

<style>
/* App level styling इथे टाकू शकतो (rare case) */
</style>
