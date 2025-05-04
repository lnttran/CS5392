"use client";

import { ArrowRight, FileText, Users, ClipboardList, LayoutTemplate, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const router = useRouter();

  const sections = [
    {
      title: "Applications",
      description: "Review and manage student applications",
      icon: ClipboardList,
      count: 8,
      path: "/dashboard/application",
      color: "from-blue-500 to-blue-600",
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      title: "Forms",
      description: "Create and manage your forms",
      icon: FileText,
      count: 3,
      path: "/dashboard/form",
      color: "from-purple-500 to-purple-600",
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      title: "Templates",
      description: "Manage form templates",
      icon: LayoutTemplate,
      count: 5,
      path: "/dashboard/template",
      color: "from-green-500 to-green-600",
      gradient: "bg-gradient-to-br from-green-50 to-green-100"
    },
    {
      title: "Users",
      description: "Manage system users",
      icon: Users,
      count: 12,
      path: "/dashboard/manage-users",
      color: "from-orange-500 to-orange-600",
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100"
    }
  ];

  const recentApplications = [
    {
      id: "APP-001",
      type: "Course Withdrawal",
      student: "John Smith",
      status: "pending",
      date: "2024-03-20"
    },
    {
      id: "APP-002",
      type: "Grade Appeal",
      student: "Emily Johnson",
      status: "approved",
      date: "2024-03-19"
    },
    {
      id: "APP-003",
      type: "Academic Probation",
      student: "Michael Brown",
      status: "rejected",
      date: "2024-03-18"
    }
  ];

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

  return (
    <div className="bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Card 
              key={section.title}
              className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${section.gradient} hover:scale-[1.02]`}
              onClick={() => router.push(section.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {section.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${section.gradient}`}>
                  <section.icon className={`h-4 w-4 ${section.color.replace('from-', 'text-').replace(' to-', '/')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{section.count}</div>
                <p className="text-xs text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:bg-white/50 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(section.path);
                  }}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-background to-muted/50">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest applications that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div 
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.type}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{app.student}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{app.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                      <Button variant="outline" size="sm" className="hover:bg-primary/10">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start hover:bg-primary/10 transition-colors duration-200" 
                  variant="outline"
                  onClick={() => router.push("/dashboard/form/create")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Form
                </Button>
                <Button 
                  className="w-full justify-start hover:bg-primary/10 transition-colors duration-200" 
                  variant="outline"
                  onClick={() => router.push("/dashboard/template/create-template")}
                >
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
                <Button 
                  className="w-full justify-start hover:bg-primary/10 transition-colors duration-200" 
                  variant="outline"
                  onClick={() => router.push("/dashboard/manage-users/create")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
