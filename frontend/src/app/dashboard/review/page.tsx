"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetch";
import { FormDetails, FormWithSignatureStatus, Signature } from "@/types/form";
import { FormStatus } from "@/types/template";
import { getStatusBadge } from "@/components/ui/statusBadge";

type SortField = "formid" | "title" | "created_date" | "signature_status";
type SortOrder = "asc" | "desc";

export default function ApplicationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("formid");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [formWithSignatureStatus, setformWithSignatureStatus] = useState<
    FormWithSignatureStatus[]
  >([]);
  const [currentApplication, setcurrentApplication] = useState<FormDetails>();

  const fetchSignatures = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/review-forms`,
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
      console.log(data, "signature data");
      setformWithSignatureStatus(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  // Filter applications based on search term and status filter
  const filteredApplications = formWithSignatureStatus.filter((app) => {
    const matchesSearch =
      app.formid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.status?.toLowerCase?.().includes(searchTerm.toLowerCase()) ?? false);

    // Fix: use app.signature_status for statusFilter, not app.status
    const matchesStatus = statusFilter
      ? app.signature_status === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortField === "created_date") {
      return sortOrder === "asc"
        ? new Date(a.created_date).getTime() -
            new Date(b.created_date).getTime()
        : new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime();
    }

    const aValue = a[sortField].toString().toLowerCase();
    const bValue = b[sortField].toString().toLowerCase();

    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Applications to Review
          </h1>
          <p className="text-gray-500 mt-1">
            Review and sign student applications that require your approval
          </p>
        </div>

        <Card className="mb-6 shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by ID, status or form type..."
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
                    Your Task:{" "}
                    {statusFilter
                      ? statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1).toLowerCase()
                      : "All"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("APPROVED")}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")}>
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead
                      className="cursor-pointer font-medium text-gray-700"
                      onClick={() => handleSort("formid")}
                    >
                      <div className="flex items-center">
                        ID {getSortIcon("formid")}
                      </div>
                    </TableHead>

                    <TableHead
                      className="cursor-pointer font-medium text-gray-700"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center">
                        Form Type {getSortIcon("title")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer font-medium text-gray-700"
                      onClick={() => handleSort("created_date")}
                    >
                      <div className="flex items-center">
                        Date Posted {getSortIcon("created_date")}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      <div className="flex items-center">Form Status</div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer font-medium text-gray-700"
                      onClick={() => handleSort("signature_status")}
                    >
                      <div className="flex items-center">
                        Your Task {getSortIcon("signature_status")}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.length > 0 ? (
                    sortedApplications.map((app) => (
                      <TableRow
                        key={app.formid}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {app.formid}
                        </TableCell>
                        <TableCell>{app.title}</TableCell>
                        <TableCell>{formatDate(app.created_date)}</TableCell>
                        <TableCell>
                          {getStatusBadge(app.status as FormStatus)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(
                            app.signature_status as unknown as FormStatus
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                            onClick={() =>
                              router.push(`/dashboard/review/${app.formid}`)
                            }
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Search className="h-10 w-10 text-gray-300 mb-2" />
                          <p>No applications found matching your criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
