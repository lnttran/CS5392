"use client";

import {
  Edit,
  File,
  MoreHorizontal,
  Plus,
  Trash,
  View,
  Filter,
  Search,
} from "lucide-react";
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
import { use, useEffect, useState } from "react";
import { userLevels } from "@/lib/user-levels";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { fetchWithAuth } from "@/lib/fetch";
import { Form } from "@/types/form";
import { getStatusBadge } from "@/components/ui/statusBadge";
import { FormStatus } from "@/types/template";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";

export default function FormPage() {
  const [currentUserApplicaition, setCurrentUserApplication] = useState<Form[]>(
    []
  );

  const [allApplication, setAllApplication] = useState<Form[]>([]);

  const [currentUser, setCurrentUser] = useState<User>();

  const [searchTerm, setSearchTerm] = useState("");

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

  const [applicationStatus, setApplicationStatus] = useState<
    Record<string, FormStatus>
  >({});

  const fetchForms = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch forms:", res.statusText);
        return null;
      }

      const data = await res.json();
      setCurrentUserApplication(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      return null;
    }
  };

  const fetchAllForms = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/admin/all`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch forms:", res.statusText);
        return null;
      }

      const data = await res.json();
      setAllApplication(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      return null;
    }
  };

  const decideStatus = async (formid: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/${formid}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch forms:", res.statusText);
        return;
      }

      const data = await res.json();
      console.log(data, "data inside decide status");
      const signatures = data?.signatures || [];

      if (signatures.some((s: any) => s.status === "REJECTED")) {
        return "REJECTED";
      } else if (signatures.every((s: any) => s.status === "APPROVED")) {
        return "APPROVED";
      } else {
        return "PENDING";
      }
    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/${formId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.text(); // Use text in case there's no JSON
        throw new Error(data || "Failed to delete form");
      }

      toast.success("Form deleted successfully");
      if (Number(currentUser?.level) === 4) {
        fetchAllForms();
      } else {
        fetchForms();
      }
    } catch (err) {
      console.error("Error deleting form:", err);
      toast.error("Failed to delete form");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (Number(currentUser?.level) === 4) {
      fetchAllForms();
    } else {
      fetchForms();
    }
  }, [currentUser]);

  //loop through the currentUserApplication and get the status of each form
  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await Promise.all(
        currentUserApplicaition.map(async (form) => {
          return await decideStatus(form.formid);
        })
      );
      setApplicationStatus((prev) => {
        const updatedStatus = { ...prev };
        currentUserApplicaition.forEach((form, index) => {
          updatedStatus[form.formid] = statuses[index] ?? "PENDING";
        });
        return updatedStatus;
      });
    };

    fetchStatuses();
  }, [currentUserApplicaition]);

  // Filter logic for search
  const filteredApplications = (
    Number(currentUser?.level) === 4 ? allApplication : currentUserApplicaition
  ).filter((form) => {
    const matchesSearch =
      form.formid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.status ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const router = useRouter();

  return (
    <div className=" bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {Number(currentUser?.level) === 4 ? "All Form" : "My form"}
          </h1>
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
        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by ID, title, or status..."
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 ">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Form ID</TableHead>
                  <TableHead className="min-w-[300px]">Title</TableHead>
                  <TableHead className="w-[300px]">Submitted at</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                  <TableHead className="w-[150px]"> Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((form) => {
                  let status = applicationStatus[form.formid] ?? "PENDING";
                  if ((form.status ?? "") === "REJECTED") {
                    status = "REJECTED";
                  }
                  if ((form.status ?? "") === "APPROVED") {
                    status = "APPROVED";
                  }
                  return (
                    <TableRow key={form.formid}>
                      <TableCell>{form.formid}</TableCell>
                      <TableCell>{form.title}</TableCell>
                      <TableCell>{form.created_date}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/form/${form.formid}`)
                            }
                          >
                            <File className="h-4 w-4 mr-1" /> View
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
                                <DialogClose asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteForm(form.formid)}
                                  >
                                    Delete
                                  </Button>
                                </DialogClose>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
