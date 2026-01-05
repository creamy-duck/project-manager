<script setup lang="ts">
import {
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
  IconUsers,
} from '@tabler/icons-vue'

import NavDummy from '@/components/MainLayout/NavDummy.vue'
import NavMain from '@/components/MainLayout/NavMain.vue'
import NavSecondary from '@/components/MainLayout/NavSecondary.vue'
import NavUser from '@/components/MainLayout/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Creamy Duck',
    email: 'creamy_duck2000@dmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Projects',
      url: '#',
      icon: IconFolder,
    },
    {
      title: 'Team',
      url: '#',
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
  ],
  dummy: [
    {
      name: 'Dummy 1',
      url: '#',
      icon: IconDatabase,
    },
    {
      name: 'Dummy 2',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Dummy 3',
      url: '#',
      icon: IconFileDescription,
    },
  ],
}
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child class="data-[slot=sidebar-menu-button]:!p-1.5">
            <a href="#">
              <IconInnerShadowTop class="!size-5" />
              <span class="text-base font-semibold">Project Manager</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavDummy :items="data.dummy" />
      <NavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>
