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

export default function Dashboard() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="flex-1 overflow-hidden"></div>
      </div>
    </div>
  );
}
