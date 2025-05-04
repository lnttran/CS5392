"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Mock data for applications
const mockApplications = [
  {
    id: "APP-001",
    studentName: "John Smith",
    formType: "Course Withdrawal",
    datePosted: "2023-05-15",
    status: "pending",
    level: "1",
    title: "Instructor"
  },
  {
    id: "APP-002",
    studentName: "Emily Johnson",
    formType: "Grade Appeal",
    datePosted: "2023-05-10",
    status: "approved",
    level: "2",
    title: "Department Chair"
  },
  {
    id: "APP-003",
    studentName: "Michael Brown",
    formType: "Academic Probation Appeal",
    datePosted: "2023-05-08",
    status: "rejected",
    level: "3",
    title: "Dean"
  },
  {
    id: "APP-004",
    studentName: "Sarah Davis",
    formType: "Course Withdrawal",
    datePosted: "2023-05-05",
    status: "pending",
    level: "1",
    title: "Instructor"
  },
  {
    id: "APP-005",
    studentName: "David Wilson",
    formType: "Leave of Absence",
    datePosted: "2023-05-01",
    status: "pending",
    level: "2",
    title: "Department Chair"
  },
  {
    id: "APP-006",
    studentName: "Jennifer Lee",
    formType: "Grade Appeal",
    datePosted: "2023-04-28",
    status: "approved",
    level: "1",
    title: "Instructor"
  },
  {
    id: "APP-007",
    studentName: "Robert Taylor",
    formType: "Academic Probation Appeal",
    datePosted: "2023-04-25",
    status: "rejected",
    level: "2",
    title: "Department Chair"
  },
  {
    id: "APP-008",
    studentName: "Lisa Anderson",
    formType: "Course Withdrawal",
    datePosted: "2023-04-20",
    status: "pending",
    level: "3",
    title: "Dean"
  }
];

type SortField = "id" | "studentName" | "formType" | "datePosted" | "status";
type SortOrder = "asc" | "desc";

export default function ApplicationPage() {
  const router = useRouter();
  const [applications, setApplications] = useState(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("datePosted");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.formType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortField === "datePosted") {
      return sortOrder === "asc" 
        ? new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
        : new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
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
    return sortOrder === "asc" 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Applications to Review</h1>
          <p className="text-gray-500 mt-1">Review and sign student applications that require your approval</p>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {applications.filter(app => app.status === "pending").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved Applications</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {applications.filter(app => app.status === "approved").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected Applications</p>
                <p className="text-3xl font-bold text-red-700 mt-1">
                  {applications.filter(app => app.status === "rejected").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 shadow-md border-gray-200">
        
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by ID, student name, or form type..."
                className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto border-gray-300 hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
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
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer font-medium text-gray-700"
                    onClick={() => handleSort("studentName")}
                  >
                    <div className="flex items-center">
                      Student Name {getSortIcon("studentName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer font-medium text-gray-700"
                    onClick={() => handleSort("formType")}
                  >
                    <div className="flex items-center">
                      Form Type {getSortIcon("formType")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer font-medium text-gray-700"
                    onClick={() => handleSort("datePosted")}
                  >
                    <div className="flex items-center">
                      Date Posted {getSortIcon("datePosted")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer font-medium text-gray-700"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.length > 0 ? (
                  sortedApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.studentName}</TableCell>
                      <TableCell>{app.formType}</TableCell>
                      <TableCell>{formatDate(app.datePosted)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                          onClick={() => router.push(`/dashboard/application/${app.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
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
