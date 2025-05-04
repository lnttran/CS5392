"use client";

import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
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
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

const submittedForms = [
  {
    id: "SF001",
    title: "Graduation Application",
    submittedBy: "John Doe",
    submittedAt: "2025-03-05",
    status: "Pending",
  },
  {
    id: "SF002",
    title: "Course Registration",
    submittedBy: "Jane Smith",
    submittedAt: "2025-03-10",
    status: "Approved",
  },
  {
    id: "SF003",
    title: "Financial Aid Request",
    submittedBy: "Alice Johnson",
    submittedAt: "2025-03-15",
    status: "Rejected",
  },
];
export default function FormPage() {
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

  const router = useRouter();

  async function deleteUser(username: string) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

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
    <div className=" bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My form</h1>
          <Button
            className="font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
            onClick={() =>
              router.push("/dashboard/form/create/select-template")
            }
          >
            <Plus className="h-5 w-5" />
            Create a form
          </Button>
        </div>
        <div className="flex-1 ">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Form ID</TableHead>
                  <TableHead className="min-w-[300px]">Title</TableHead>
                  <TableHead className="w-[300px]">Submitted at</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]"> Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedForms.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.id}</TableCell>
                    <TableCell>{template.title}</TableCell>
                    <TableCell>{template.submittedAt}</TableCell>
                    <TableCell>{template.status}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Are you sure?</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete the form template.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Cancel</Button>
                              <Button variant="destructive">Delete</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
