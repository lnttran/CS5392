"use client";

import {
  MoreHorizontal,
  Filter,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
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
import { useEffect, useState } from "react";
import { userLevels } from "@/lib/user-levels";
import { toast } from "sonner";
import { TitleManagement } from "@/components/users/title-management";
import { User } from "@/types/user";
import { fetchWithAuth } from "@/lib/fetch";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof User>("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // Filter and sort logic
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.title ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter !== null ? Number(user.level) === levelFilter : true;

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  async function deleteUser(username: string) {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${username}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast("Account deleted successfully");
        fetchUsers();
      } else {
        toast(
          "Account cannot be deleted because this account is assigned to a form/signature"
        );
        console.log("Error deleting user:", response.statusText);
      }
    } catch (error) {
      console.log("Error:", error);
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
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by username, name, email, or title..."
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto border-gray-300 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Level:{" "}
                {levelFilter !== null
                  ? (userLevels[levelFilter]?.label ?? levelFilter)
                  : "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLevelFilter(null)}>
                All
              </DropdownMenuItem>
              {Object.entries(userLevels).map(([level, info]) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => setLevelFilter(Number(level))}
                >
                  {info.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[200px] cursor-pointer"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center">
                      Username {getSortIcon("username")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[300px] cursor-pointer"
                    onClick={() => handleSort("firstname")}
                  >
                    <div className="flex items-center">
                      Name {getSortIcon("firstname")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[200px] cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[200px] cursor-pointer"
                    onClick={() => handleSort("level")}
                  >
                    <div className="flex items-center">
                      Level {getSortIcon("level")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[300px] cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Title {getSortIcon("title")}
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                    <TableCell>{user.title}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
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
