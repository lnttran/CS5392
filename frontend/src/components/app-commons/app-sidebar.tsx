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
import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "@/lib/fetch";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@react-email/components";
import { User } from "@/types/user";

// Menu items.
const AdministratorItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Review",
    url: "/dashboard/review",
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
    title: "All forms",
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
];
const upperUserItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Review",
    url: "/dashboard/review",
    icon: Inbox,
  },
  {
    title: "My form",
    url: "/dashboard/form",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);

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
        setCurrentUser(data);
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
              {(Number(currentUser?.level) === 4
                ? AdministratorItems
                : Number(currentUser?.level) === 0
                  ? UserItems
                  : upperUserItems
              ).map((item) => (
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
                      ? `${currentUser.firstname} ${currentUser.lastname}`
                      : "Username"}
                  </div>
                  <ChevronUp className="ml-auto" size={20} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
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
      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personal Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">First Name: </span>
              <span>{currentUser?.firstname || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Last Name: </span>
              <span>{currentUser?.lastname || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Username: </span>
              <span>{currentUser?.username || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              <span>{currentUser?.email || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Level: </span>
              <span>{currentUser?.level || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Title: </span>
              <span>{currentUser?.title || "-"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProfile(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
