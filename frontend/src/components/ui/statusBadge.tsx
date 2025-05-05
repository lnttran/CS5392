import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "./badge";
import { FormStatus } from "@/types/template";
import { fetchWithAuth } from "@/lib/fetch";
import { use, useEffect, useState } from "react";
import { FormDetails } from "@/types/form";

export function getStatusBadge(status: FormStatus) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-300"
        >
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          <XCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      );
    case "DRAFT":
    case "SUBMITTED":
    case "INACTIVE":
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300"
        >
          <Clock className="h-3 w-3 mr-1" /> {status}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
