"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash, Plus, Edit2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Title } from "@/types/title";
import { fetchWithAuth } from "@/lib/fetch";

export function TitleManagement() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const storedToken = localStorage.getItem("token");
      console.log(storedToken, "token");
      if (!storedToken) {
        window.location.href = "/authentication";
      } else {
        setToken(storedToken);
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && token) {
      fetchTitles();
    }
  }, [token, open]);

  const fetchTitles = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data, "titles");
        setTitles(data);
      } else {
        toast.error("Failed to fetch titles");
      }
    } catch (error) {
      toast.error("Failed to fetch titles");
    }
  };

  const handleAddTitle = async () => {
    if (!newTitle) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles`,
        {
          method: "POST",
          body: JSON.stringify({ title: newTitle }),
        }
      );

      if (response.ok) {
        toast.success("Title added successfully");
        setNewTitle("");
        fetchTitles();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add title");
      }
    } catch (error) {
      toast.error("Failed to add title");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTitle = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/titles/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTitles(titles.filter((title) => title.title_id !== id));
        toast.success("Title deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete title");
      }
    } catch (error) {
      toast.error("Failed to delete title");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          {/* <Plus className="h-4 w-4" /> */}
          Manage Titles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Titles</DialogTitle>
          <DialogDescription>
            Add, view, and delete titles that can be assigned to users
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Title Name (e.g., Professor, Dean, Student)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddTitle}
              disabled={isLoading || !newTitle}
              className="whitespace-nowrap"
            >
              {isLoading ? "Adding..." : "Add Title"}
            </Button>
          </div>
        </div>

        {titles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border rounded-md border-dashed">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No titles yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Add titles to assign to users. Titles help organize users by their
              roles and permissions.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title Name</TableHead>

                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {titles.map((title) => (
                  <TableRow key={title.title_id}>
                    <TableCell className="font-medium">{title.title}</TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTitle(title.title_id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
