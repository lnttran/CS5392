"use client";

import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Signup } from "@/components/users/signup";
import { useEffect, useState } from "react";
import { userLevels } from "@/lib/user-levels";
import { toast } from "sonner";
import { TitleManagement } from "@/components/users/title-management";
import { User } from "@/types/user";
import { fetchWithAuth } from "@/lib/fetch";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // This runs only in the browser
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("You are not logged in");
      window.location.href = "/authentication";
    } else {
      setToken(storedToken);
    }
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/admin/all`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log(data, "users");

      if (res.ok) {
        setUsers(data);
      } else {
        console.error("Error fetching all users:", data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchUsers(); // Only fetch users if token exists
    }
  }, [token]);

  //get local storage token

  async function deleteUser(username: string) {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${username}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("User deleted successfully:", data);
        window.location.reload();
      } else {
        console.error("Error deleting user:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
          <div className="flex flex-row gap-10">
            <TitleManagement />
            {token && <Signup token={token} onUserCreated={fetchUsers} />}
          </div>
        </div>
        <div className="flex-1">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Username</TableHead>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead className="min-w-[300px]">Email</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{`${user.firstname} ${user.lastname}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`bg-[#${userLevels[user.level].color}] hover:bg-[${userLevels[user.level].color}]`}
                      >
                        Level {userLevels[user.level].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteUser(user.username)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
