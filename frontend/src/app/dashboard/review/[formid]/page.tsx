"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/fetch";
import { Form, FormDetails, SignApplication } from "@/types/form";
import type { FormStatus, FormTemplateWithContents } from "@/types/template";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getStatusBadge } from "@/components/ui/statusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Title } from "@/types/title";

export default function ReviewForm() {
  const params = useParams();
  const router = useRouter();
  const rawFormid = params.formid;
  const formid = Array.isArray(rawFormid) ? rawFormid[0] : rawFormid;
  const [currentApplication, setcurrentApplication] = useState<FormDetails>();
  const [applicantInfo, setApplicantInfo] = useState<User>();
  const [titles, setTitles] = useState<Title[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
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
  const [signerApproval, setSignerApproval] = useState<SignApplication>({
    signature_template_id: 0,
    decided_on: new Date().toISOString().split("T")[0],
    signature: "",
    rejection_reason: null,
    status: "PENDING", // Ensure "PENDING" is part of the FormStatus type
    title_id: currentUser?.title_id || "",
    signatureid: 0,
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch current user:", res.statusText);
        return null;
      }
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error("Error fetching current user:", err);
      return null;
    }
  };

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
      console.log(data, "current application");
      setcurrentApplication(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentApplication) {
      toast("No application found.");
      return;
    }

    if (
      !signerApproval.signature ||
      !signerApproval.title_id ||
      !signerApproval.decided_on
    ) {
      toast("Please enter information for required field.");
      return;
    }

    if (
      signerApproval.status === "REJECTED" &&
      !signerApproval.rejection_reason
    ) {
      toast("Please provide a reason for rejection.");
      return;
    }

    console.log(signerApproval, "signer approval");
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/${currentApplication.formid}/sign`,
        {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify(signerApproval),
        }
      );

      const message = await response.text();

      if (response.ok) {
        toast("Signature submitted successfully.");
        router.back();
        // Optionally redirect or refresh data
      } else {
        toast(`Failed to submit signature: ${message}`);
        console.error("Error:", message);
      }
    } catch (error) {
      console.error("Error submitting signature:", error);
      toast("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    async function fetchTitles() {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles`,
          { method: "GET", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setTitles(data);
        }
      } catch (err) {
        console.error("Error fetching titles:", err);
      }
    }
    fetchTitles();
  }, []);

  useEffect(() => {
    fetchForms();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentApplication) {
      fetchTemplate(currentApplication.formtypeid);
      fetchApplicantInfo(currentApplication.username);
      currentApplication.signatures.forEach((signature) => {
        fetchSignerInfo(signature.username);
      });
    }
  }, [currentApplication]);

  return (
    <div className="container mx-auto p-6">
      {currentApplication && applicantInfo && formTemplate && signerInfo && (
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
            <h1 className="text-3xl font-bold">{currentApplication.title}</h1>
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
                    <p className="text-md">{currentApplication.formtypeid}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className="text-md">{currentApplication.title}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="text-md">{currentApplication.description}</p>
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
                      defaultValue={currentApplication.formid}
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
                                currentApplication.contents.find(
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
                                currentApplication.contents.find(
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
              formTemplate.attachmentTemplates.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formTemplate.attachmentTemplates.map(
                        (attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center flex-row justify-between w-full">
                              <div className="flex flex-row gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-blue-500"
                                    >
                                      {attachment.file_type}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="font-medium">
                                  {attachment.description}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="block w-full text-sm text-gray-600
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    I confirm that all the information provided is accurate and
                    complete.
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
                    defaultValue={currentApplication.created_date}
                    className="w-full"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Signatures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formTemplate.signatureTemplates.map((signature, index) => {
                    const username =
                      currentApplication.signatures.find(
                        (sig) =>
                          sig.signature_template_id ===
                          signature.signature_template_id
                      )?.username || "";

                    const signerSignature = currentApplication.signatures.find(
                      (sig) =>
                        sig.signature_template_id ===
                        signature.signature_template_id
                    );

                    const signatureid =
                      currentApplication.signatures.find(
                        (sig) =>
                          sig.signature_template_id ===
                          signature.signature_template_id
                      )?.signatureid || "";

                    const disable =
                      signerSignature?.username !== currentUser?.username ||
                      currentApplication.next_signer_level !==
                        currentUser?.level;

                    const isNextSigner =
                      currentApplication.next_signer_level ===
                      currentUser?.level;

                    return (
                      <div
                        key={index}
                        className="flex flex-col border rounded-lg p-4 gap-4"
                      >
                        <div className="flex flex-row items-center justify-between gap-4">
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
                                currentApplication.signatures.find(
                                  (sig) =>
                                    sig.signature_template_id ===
                                    signature.signature_template_id
                                );

                              const status =
                                signatureData?.status as unknown as FormStatus;

                              return (
                                <>
                                  {getStatusBadge(status)}
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
                        {/* Approval/Reject field */}
                        {isNextSigner &&
                        signerSignature?.username === currentUser?.username ? (
                          <div className="space-y-2 grid grid-cols-4 gap-4">
                            {/* Approval */}
                            <div>
                              <Label>Approval</Label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    name={`${username}-approval`}
                                    value="approve"
                                    checked={
                                      !disable &&
                                      signerApproval.status === "APPROVED"
                                    }
                                    onChange={() => {
                                      if (!disable) {
                                        setSignerApproval((prev) => ({
                                          ...prev,
                                          status: "APPROVED",
                                        }));
                                      }
                                    }}
                                    disabled={disable}
                                  />
                                  Approve
                                </label>
                                <label className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    name={`${username}-approval`}
                                    value="reject"
                                    checked={
                                      !disable &&
                                      signerApproval.status === "REJECTED"
                                    }
                                    onChange={() => {
                                      if (!disable) {
                                        setSignerApproval((prev) => ({
                                          ...prev,
                                          status: "REJECTED",
                                        }));
                                      }
                                    }}
                                    disabled={disable}
                                  />
                                  Reject
                                </label>
                              </div>
                              {!disable &&
                                signerApproval.status === "REJECTED" && (
                                  <div className="mt-2">
                                    <Label htmlFor={`${username}-rejectReason`}>
                                      Reason for rejection{" "}
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      id={`${username}-rejectReason`}
                                      value={
                                        signerApproval.rejection_reason || ""
                                      }
                                      onChange={(e) =>
                                        setSignerApproval({
                                          ...signerApproval,
                                          rejection_reason: e.target.value,
                                        })
                                      }
                                      required
                                      placeholder="Please provide the reason for rejection"
                                    />
                                  </div>
                                )}
                            </div>
                            {/* Title */}
                            <div>
                              <Label htmlFor={`${username}-title`}>Title</Label>
                              <Select
                                onValueChange={(val) =>
                                  setSignerApproval({
                                    ...signerApproval,
                                    title_id: val,
                                  })
                                }
                                defaultValue={signerApproval.title_id}
                                disabled={disable}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user title" />
                                </SelectTrigger>
                                <SelectContent>
                                  {titles.map((title) => (
                                    <SelectItem
                                      key={title.title_id}
                                      value={String(title.title_id)}
                                    >
                                      {title.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Signature */}
                            <div>
                              <Label htmlFor={`${username}-signature`}>
                                Signature
                              </Label>
                              <Input
                                id={`${username}-signature`}
                                placeholder="Enter your first and last name"
                                disabled={disable}
                                value={!disable ? signerApproval.signature : ""}
                                onChange={(e) => {
                                  if (!disable) {
                                    setSignerApproval((prev) => ({
                                      ...prev,
                                      signature: e.target.value,
                                      signatureid: Number(signatureid),
                                      signature_template_id:
                                        signature.signature_template_id,
                                    }));
                                  }
                                }}
                              />
                            </div>
                            {/* Sign Date */}
                            <div>
                              <Label htmlFor={`${username}-signDate`}>
                                Sign Date
                              </Label>
                              <Input
                                id={`${username}-signDate`}
                                type="date"
                                value={
                                  disable
                                    ? signerSignature?.decided_on || ""
                                    : signerApproval.decided_on
                                }
                                disabled
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            {currentApplication.status === "REJECTED"
                              ? "Form REJECTED, no signature required"
                              : signerSignature?.username !==
                                  currentUser?.username
                                ? // Messages for other users' signatures
                                  signerSignature?.status === "PENDING"
                                  ? "Waiting for them to sign"
                                  : signerSignature?.status === "APPROVED"
                                    ? "They have approved this form"
                                    : signerSignature?.status === "REJECTED"
                                      ? "They have rejected this form"
                                      : "Signature status unknown"
                                : // Messages for current user's signature
                                  signerSignature?.status === "PENDING"
                                  ? "Waiting for your turn"
                                  : "You have already signed this"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button
                className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC] hover:bg-blue-500"
                onClick={handleSubmit}
                disabled={
                  currentApplication?.status === "REJECTED" ||
                  currentApplication?.status === "COMPLETED" ||
                  currentApplication?.next_signer_level !== currentUser?.level
                }
              >
                Submit
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
