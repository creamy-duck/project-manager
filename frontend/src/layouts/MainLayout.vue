<script setup lang="ts">
import AppSidebar from '@/components/MainLayout/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
