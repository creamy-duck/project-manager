<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
    </SidebarInset>
  </SidebarProvider>
</template>
