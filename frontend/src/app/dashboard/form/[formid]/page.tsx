"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchWithAuth } from "@/lib/fetch";
import { FormDetails } from "@/types/form";
import type { FormStatus, FormTemplateWithContents } from "@/types/template";
import { set } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sign } from "crypto";
import { Checkbox } from "@radix-ui/react-checkbox";
import { AttachmentTemplateJS } from "@/types/template";

export default function FillForm() {
  const params = useParams();
  const router = useRouter();
  const rawFormid = params.formid;
  const formid = Array.isArray(rawFormid) ? rawFormid[0] : rawFormid;
  const [currentUserApplication, setCurrentUserApplication] =
    useState<FormDetails>();
  const [applicantInfo, setApplicantInfo] = useState<User>();
  const [formTemplate, setFormTemplate] = useState<FormTemplateWithContents>();
  const [signerInfo, setSignerInfo] = useState<
    Record<
      string,
      {
        firstName: string;
        lastName: string;
        title: string;
        level: string;
      }
    >
  >({});

  const fetchForms = async () => {
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
        return null;
      }

      const data = await res.json();
      setCurrentUserApplication(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      return null;
    }
  };

  const fetchApplicantInfo = async (username: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${username}`,
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
      console.log(data, "applicant info");
      setApplicantInfo(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      return null;
    }
  };

  const fetchSignerInfo = async (username: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${username}`,
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
      console.log(data, "signer info");
      setSignerInfo((prev) => ({
        ...prev,
        [username]: {
          firstName: data.firstname,
          lastName: data.lastname,
          title: data.title,
          level: data.level,
        },
      }));
    } catch (err) {
      console.error("Error fetching signer info:", err);
    }
  };

  const fetchTemplate = async (formtypeid: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/form-templates/${formtypeid}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch template");
      }

      const data = await res.json();
      console.log(data, "templates");
      setFormTemplate(data);
    } catch (err) {
      console.error("Error fetching template:", err);
      toast.error("Could not load form template");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (currentUserApplication) {
      fetchTemplate(currentUserApplication.formtypeid);
      fetchApplicantInfo(currentUserApplication.username);
      currentUserApplication.signatures.forEach((signature) => {
        fetchSignerInfo(signature.username);
      });
    }
  }, [currentUserApplication]);

  return (
    <div className="container mx-auto p-6">
      {currentUserApplication &&
        applicantInfo &&
        formTemplate &&
        signerInfo && (
          <>
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <h1 className="text-3xl font-bold">
                {currentUserApplication.title}
              </h1>
            </div>

            <form>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Form Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Template ID
                      </p>
                      <p className="text-md">
                        {currentUserApplication.formtypeid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="text-md">{currentUserApplication.title}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Description
                    </p>
                    <p className="text-md">
                      {currentUserApplication.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Applicant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Level </Label>
                      <Input
                        id="level"
                        defaultValue={applicantInfo.level}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title </Label>
                      <Input
                        id="title"
                        defaultValue={applicantInfo.title}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name </Label>
                      <Input
                        id="firstName"
                        defaultValue={applicantInfo.firstname}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name </Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        defaultValue={applicantInfo.lastname}
                        disabled
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="formId">Form ID </Label>
                      <Input
                        id="formId"
                        placeholder="Enter form ID"
                        defaultValue={currentUserApplication.formid}
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Form Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {formTemplate.contentTemplates.map(
                      (field, index) =>
                        !field.description && (
                          <div
                            key={index}
                            className="flex items-center p-2 gap-4 justify-between rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {field.field_name}
                                {field.is_value_needed && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </div>
                            <div className="flex-1 items-center gap-4">
                              <Input
                                id={field.field_name}
                                defaultValue={
                                  currentUserApplication.contents.find(
                                    (content) =>
                                      content.content_template_id ===
                                      field.content_template_id
                                  )?.field_value || ""
                                }
                                disabled
                              />
                            </div>
                          </div>
                        )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {formTemplate.contentTemplates.map(
                      (field, index) =>
                        field.description && (
                          <div
                            key={index}
                            className="flex flex-col p-2 gap-4 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {field.field_name}
                                {field.is_value_needed && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                              {field.description && (
                                <span className="text-sm text-gray-500">
                                  : {field.description}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 items-center gap-4">
                              <Input
                                id={field.field_name}
                                defaultValue={
                                  currentUserApplication.contents.find(
                                    (content) =>
                                      content.content_template_id ===
                                      field.content_template_id
                                  )?.field_value || ""
                                }
                                disabled
                              />
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}

              {formTemplate.attachmentTemplates &&
                formTemplate.attachmentTemplates.length > 0 &&
                formTemplate.attachmentTemplates.map((field, index) => (
                  <Card key={index} className="mb-6">
                    <CardHeader>
                      <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <AttachmentItem
                          attachment_template={field}
                          attachmentid={
                            String(
                              currentUserApplication.attachments.find(
                                (att) =>
                                  att.attachment_template_id ===
                                  field.attachment_template_id
                              )?.attachmentid
                            ) || ""
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Signatures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formTemplate.signatureTemplates.map((signature, index) => {
                      const username =
                        currentUserApplication.signatures.find(
                          (sig) =>
                            sig.signature_template_id ===
                            signature.signature_template_id
                        )?.username || "";
                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 flex flex-row items-center justify-between gap-4"
                        >
                          <div className="flex gap-4 items-center">
                            <Badge
                              variant="secondary"
                              className="text-sm px-3 py-1 whitespace-nowrap"
                            >
                              {signerInfo[username]?.title} - Level{" "}
                              {signerInfo[username]?.level}
                            </Badge>
                            <Label className="flex-1">
                              {signerInfo[username]?.firstName +
                                " " +
                                signerInfo[username]?.lastName || ""}
                            </Label>
                          </div>
                          <div className="flex items-center">
                            {(() => {
                              const signatureData =
                                currentUserApplication.signatures.find(
                                  (sig) =>
                                    sig.signature_template_id ===
                                    signature.signature_template_id
                                );

                              const status = signatureData?.status as
                                | FormStatus
                                | undefined;

                              const statusColor =
                                status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800";

                              return (
                                <>
                                  <Badge
                                    variant="secondary"
                                    className={`text-sm ${statusColor}`}
                                  >
                                    {status}
                                  </Badge>
                                  {status === "REJECTED" &&
                                    signatureData?.rejection_reason && (
                                      <span className="ml-4 text-sm text-red-600">
                                        Reason: {signatureData.rejection_reason}
                                      </span>
                                    )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Applicant Signature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that all the information provided is accurate
                      and complete.
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signature">Signature </Label>
                    <div className="border rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500 text-center">
                        {applicantInfo.firstname + " " + applicantInfo.lastname}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateSigned">Date Signed </Label>
                    <Input
                      id="dateSigned"
                      type="date"
                      defaultValue={currentUserApplication.created_date}
                      className="w-full"
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </>
        )}
    </div>
  );
}

const AttachmentItem: React.FC<{
  attachment_template: AttachmentTemplateJS;
  attachmentid: string;
}> = ({ attachment_template, attachmentid }) => {
  const handleDownload = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/attachments/${attachmentid}`
      );
      if (!res.ok) {
        console.error(`Download failed: ${res.status} ${res.statusText}`);
        return;
      }

      // parse filename out of Content-Disposition
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="(.+)"/);
      const filename = match ? match[1] : "attachment.dat";

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
      <div className="flex items-center flex-row justify-between w-full">
        <div className="flex flex-row gap-4">
          {/* <span className="font-medium">{attachmentid}</span> */}

          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs text-blue-500">
                {attachment_template.file_type}
              </Badge>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {attachment_template.description}
          </span>
        </div>

        <Button onClick={handleDownload} type="button">
          Download <Download className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
