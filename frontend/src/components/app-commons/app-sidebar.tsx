"use client";

import {
  Bell,
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetch";

// Menu items.
const AdministratorItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Application",
    url: "/dashboard/application",
    icon: Inbox,
  },
  {
    title: "Templates",
    url: "/dashboard/template",
    icon: Calendar,
  },
  {
    title: "Users",
    url: "/dashboard/manage-users",
    icon: Users,
  },
  {
    title: "My form",
    url: "/dashboard/form",
    icon: Settings,
  },
];

const UserItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My form",
    url: "/dashboard/form",
    icon: Settings,
  },
  {
    title: "Notification",
    url: "/dashboard/notification",
    icon: Bell,
  },
];

export function AppSidebar() {
  const [currentUser, setCurrentUser] = useState<{
    firstName: string;
    lastName: string;
    level: string;
  } | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log(data, "data");
      if (res.ok) {
        setCurrentUser({
          firstName: data.firstname,
          lastName: data.lastname,
          level: data.level,
        });
      } else {
        console.error("Error fetching user:", data.error);
      }
    };

    fetchUser();
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/authentication";
  };
  return (
    <Sidebar variant="sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg mb-4">
            SMU Form Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentUser?.level === "4"
                ? AdministratorItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <div>
                            <item.icon size={20} />
                          </div>
                          <div className="text-lg">{item.title}</div>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                : AdministratorItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <div>
                            <item.icon size={20} />
                          </div>
                          <div className="text-lg">{item.title}</div>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="p-1  items-center flex justify-center rounded-full bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC] ">
                    <User2 size={20} className="text-white" />
                  </div>
                  <div className="text-lg">
                    {currentUser
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : "Username"}
                  </div>
                  <ChevronUp className="ml-auto" size={20} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Setting</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={signOut}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
