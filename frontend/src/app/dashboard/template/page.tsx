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
import { User } from "@prisma/client";
import { userLevels } from "@/lib/user-levels";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TemplatePage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  //   useEffect(() => {
  //     const fetchUsers = async () => {
  //       try {
  //         const res = await fetch("/api/user/all-users");
  //         if (!res.ok) throw new Error("Failed to fetch users");
  //         const data = await res.json();
  //         setUsers(data);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };

  //     fetchUsers();
  //   }, [setUsers]);

  //   async function deleteUser(username: string) {
  //     try {
  //       const response = await fetch("/api/auth/signup", {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ username }),
  //       });

  //       const data = await response.json();

  //       if (response.ok) {
  //         console.log("User deleted successfully:", data);
  //         window.location.reload();
  //       } else {
  //         console.error("Error deleting user:", data.error);
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   }

  return (
    <div className=" bg-background w-[80vw]">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Form</h1>
          <Button
            className="font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
            onClick={() => router.push("/dashboard/template/create-template")}
          >
            Create a template
          </Button>
        </div>
        <div className="flex-1 ">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Form ID</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  {/* <TableHead className="min-w-[300px]">Email</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead> */}
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
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
                )
                )} */}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
