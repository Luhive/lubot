"use client"

import * as React from "react"
import {
  BarChartIcon,
  BotIcon,
  LayoutDashboardIcon,
  SendIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon },
  { title: 'Groups', url: '/groups', icon: UsersIcon },
  { title: 'Broadcast', url: '/broadcast', icon: SendIcon },
  { title: 'Agent', url: '/agent', icon: BotIcon },
  { title: 'Settings', url: '/settings', icon: SettingsIcon },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <Link href="/dashboard">
                  <Image
                    src="/images/luhive-logo.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 shrink-0"
                    aria-hidden
                  />
                  <span className="text-base font-semibold">Lubot</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2 py-1">
            {navItems.map(item => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Telegram connected</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    );
}
