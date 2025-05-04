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
import { useRouter } from "next/navigation";
import { FormTemplate } from "@/types/template";
import { fetchWithAuth } from "@/lib/fetch";

export default function TemplatePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/form-templates`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch templates");
        }

        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className=" bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Form Template</h1>
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
                  <TableHead className="w-[200px]">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, index) => (
                  <TableRow key={index}>
                    <TableCell>{template.formtypeid}</TableCell>
                    <TableCell>{template.title}</TableCell>
                    <TableCell>{template.status}</TableCell>
                    <TableCell className="text-left">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/dashboard/template/${template.formtypeid}`
                          )
                        }
                      >
                        View
                      </Button>
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
