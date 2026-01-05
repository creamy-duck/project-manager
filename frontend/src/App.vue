<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

// Color Mode
useColorMode()
</script>

<template>
  <SidebarProvider>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
