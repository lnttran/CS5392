"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AttachmentTemplateJS,
  ContentTemplateJS,
  SignatureTemplateJS,
} from "@/types/template";
import { fetchWithAuth } from "@/lib/fetch";
import { fetchTitleById } from "@/lib/tool";
import { User } from "@/types/user";
import { generateUniqueApplicationId } from "@/types/form";

// Helper function to convert a File to a base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:*/*;base64, prefix if present
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FormApplication() {
  const router = useRouter();
  const params = useParams();
  const rawFormtypeid = params.formtypeid;
  const formtypeid = Array.isArray(rawFormtypeid)
    ? rawFormtypeid[0]
    : rawFormtypeid;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [contentTemplates, setContentTemplates] = useState<ContentTemplateJS[]>(
    []
  );
  const [signatureTemplates, setSignatureTemplates] = useState<
    SignatureTemplateJS[]
  >([]);
  const [signatureTitles, setSignatureTitles] = useState<string[]>([]);
  const [attachmentTemplates, setAttachmentTemplates] = useState<
    AttachmentTemplateJS[]
  >([]);
  const [usersByTitle, setUsersByTitle] = useState<Map<string, User[]>>(
    new Map()
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [file, setFile] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // const handleUpload = async () => {
  //   if (!file) return;
  //   setUploading(true);

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   // const res = await fetch("/api/upload", {
  //   //   method: "POST",
  //   //   body: formData,
  //   // });

  //   // if (res.ok) {
  //   setMessage("File uploaded successfully!");
  //   // } else {
  //   //   setMessage("Upload failed");
  //   // }
  //   setUploading(false);
  // };

  const fetchUser = async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();
    console.log(data, "data");
    if (res.ok) {
      setCurrentUser(data);
    } else {
      console.error("Error fetching user:", data.error);
    }
  };

  // go through signaturetemplates and get the title
  const fetchSignatureTitles = async () => {
    try {
      const titleMap = new Map<string, User[]>();
      const titles = await Promise.all(
        signatureTemplates.map(async (sig) => {
          const title = await fetchTitleById(sig.title_id);
          if (!title) return "";

          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/by-title/${sig.title_id}`,
            { method: "GET", credentials: "include" }
          );
          const users: User[] = res.ok ? await res.json() : [];
          titleMap.set(title, users);
          console.log(titleMap, "userstilemap");
          return title;
        })
      );
      // Fetch all users for this title

      setSignatureTitles(titles);
      setUsersByTitle(titleMap);
    } catch (error) {
      console.error("Error fetching signature titles:", error);
    }
  };

  const fetchTemplate = async () => {
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
      setTitle(data.title);
      setDescription(data.description);
      setContentTemplates(data.contentTemplates || []);
      setSignatureTemplates(data.signatureTemplates || []);
      setAttachmentTemplates(data.attachmentTemplates || []);
    } catch (err) {
      console.error("Error fetching template:", err);
      toast.error("Could not load form template");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (signatureTemplates.length > 0) {
      fetchSignatureTitles();
    }
  }, [signatureTemplates]);

  useEffect(() => {
    if (!formtypeid) return;
    fetchTemplate();
    generateUniqueApplicationId(formtypeid)
      .then((id) => setApplicationId(id))
      .catch((err) => {
        console.error("Error generating application ID:", err);
      });
  }, [formtypeid]);

  const [contentValues, setContentValues] = useState<
    Record<number, string | boolean>
  >({});

  const [signatureInfo, setSignatureInfo] = useState({
    signature: "",
    dateSigned: new Date().toISOString().split("T")[0],
    agreed: false,
  });
  const [signerInfo, setSignerInfo] = useState<
    Record<number, { username: string; title_id: string }>
  >({});

  const handleInputChange = (
    content_template_id: number,
    value: string | boolean
  ) => {
    setContentValues((prev) => ({
      ...prev,
      [content_template_id]: value,
    }));
  };

  const handleSignatureInfoChange = (
    field: string,
    value: string | boolean
  ) => {
    setSignatureInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignerInfoChange = (
    signature_template_id: number,
    username: string,
    title_id: string
  ) => {
    setSignerInfo((prev) => ({
      ...prev,
      [signature_template_id]: { username, title_id },
    }));

    console.log(signerInfo, "signerInfo");
  };

  const renderInputField = (field: {
    name: string;
    valueType: string;
    templates_id: number;
    require: boolean;
  }) => {
    switch (field.valueType) {
      case "TEXT":
        return (
          <Input
            type="text"
            placeholder={`Enter ${field.name}`}
            value={(contentValues[field.templates_id] as string) || ""}
            onChange={(e) =>
              handleInputChange(field.templates_id, e.target.value)
            }
            className="flex-1 w-full"
            required={field.require}
          />
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.name}`}
            value={(contentValues[field.templates_id] as string) || ""}
            onChange={(e) =>
              handleInputChange(field.templates_id, e.target.value)
            }
            className="flex-1 w-full"
            required={field.require}
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={(contentValues[field.templates_id] as boolean) || false}
              onCheckedChange={(checked) =>
                handleInputChange(field.templates_id, checked as boolean)
              }
            />
            <label htmlFor={field.name} className="text-sm text-gray-500">
              Yes
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser === null) {
      toast.error("User not found");
      return;
    }

    for (const [id, value] of Object.entries(contentValues)) {
      if (typeof value === "string" && value == "") {
        toast.error(`Need to fill all the boxes.`);
      }
    }

    // Validate attachments
    for (const [id, value] of Object.entries(file)) {
      if (!value) {
        toast.error(`Please provide required attachment for your application.`);
        return;
      }
    }

    // Validate signatures
    for (const [id, value] of Object.entries(signerInfo)) {
      if (!value || value.title_id === "" || value.username === "") {
        toast.error(`Please select signer for your application.`);
        return;
      }
    }

    // Convert all files to base64
    const attachments: any[] = [];
    for (const [key, value] of Object.entries(file)) {
      if (value) {
        const base64 = await fileToBase64(value as File);
        attachments.push({
          formid: applicationId,
          attachment_template_id: key,
          file_content: base64,
        });
      }
    }

    const payload = {
      formid: applicationId,
      formtypeid: formtypeid,
      status: "SUBMITTED",
      username: currentUser.username,
      created_data: signatureInfo.dateSigned,
      last_updated: signatureInfo.dateSigned,
      contents: Object.entries(contentValues).map(([key, value]) => ({
        formid: applicationId,
        field_value: value,
        content_template_id: key,
      })),
      attachments,
      signatures: Object.entries(signerInfo).map(([key, value]) => ({
        signature_template_id: key,
        formid: applicationId,
        username: value.username,
        title_id: value.title_id,
      })),
    };

    console.log(payload, "payload");

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setContentValues({});
        setFile({});
        setSignerInfo({});
        alert("Form Template created successfully!");
        router.back();
      } else {
        console.error("Error:", data);
        alert("Failed to create form template.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong.");
    }
    // Here you would typically send the form data to your backend
    console.log("Form submitted");
  };

  return (
    <div className="container mx-auto p-6 w-[80vw]">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      {/* Header Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Template ID</p>
              <p className="text-md">{formtypeid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="text-md">{title}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-md">{description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level </Label>
              <Input id="level" defaultValue={currentUser?.level} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title </Label>
              <Input id="title" defaultValue={currentUser?.title} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name </Label>
              <Input
                id="firstName"
                defaultValue={currentUser?.firstname}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                defaultValue={currentUser?.lastname}
                disabled
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="formId">Form ID </Label>
              <Input
                id="formId"
                placeholder="Enter form ID"
                defaultValue={applicationId}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {contentTemplates.map(
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
                      {renderInputField({
                        name: field.field_name,
                        valueType: field.value_type,
                        templates_id: field.content_template_id,
                        require: field.is_value_needed,
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2">
            {contentTemplates.map(
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
                      {renderInputField({
                        name: field.field_name,
                        valueType: field.value_type,
                        templates_id: field.content_template_id,
                        require: field.is_value_needed,
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        </CardContent>
      </Card>
      {/* Attachments */}

      {attachmentTemplates.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attachmentTemplates.map((attachment, index) => (
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

                    {/* <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`w-full px-4 py-2 rounded-md text-white font-semibold
                 ${uploading || !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button> */}

                    {/* {message && (
                  <div
                    className={`text-sm font-medium ${
                      message.includes("success")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </div>
                )} */}

                    <div className="space-y-2">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile((prev) => ({
                              ...prev,
                              [attachment.attachment_template_id]: file,
                            }));
                          }
                        }}
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {signatureTemplates.map((signature, index) => {
              return (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {signatureTitles[index]}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(username) => {
                        handleSignerInfoChange(
                          signature.signature_template_id,
                          username,
                          signature.title_id
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a signer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(usersByTitle.get(signatureTitles[index]) || []).map(
                          (user, i) => (
                            <SelectItem key={i} value={`${user.username}`}>
                              {user.firstname} {user.lastname}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Applicant Signature */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applicant Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Agreement Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToSign"
                checked={signatureInfo.agreed || false}
                onCheckedChange={(checked: boolean) =>
                  handleSignatureInfoChange("agreed", checked === true)
                }
              />
              <Label htmlFor="agreeToSign">I agree to sign this form</Label>
            </div>

            {/* Signature Box (only shown if agreed) */}
            {signatureInfo.agreed && (
              <div className="space-y-2">
                <Label htmlFor="signature">Signature </Label>
                <div className="border rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500 text-center">
                    {currentUser?.firstname && currentUser?.lastname
                      ? `${currentUser.firstname} ${currentUser.lastname}`
                      : "Your signature will appear here"}
                  </p>
                </div>
              </div>
            )}

            {/* Date Signed */}
            <div className="space-y-2">
              <Label htmlFor="dateSigned">Date Signed </Label>
              <Input
                id="dateSigned"
                type="date"
                value={signatureInfo.dateSigned}
                onChange={(e) =>
                  handleSignatureInfoChange("dateSigned", e.target.value)
                }
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                By signing this form, you confirm that all information provided
                is accurate and complete.
              </p>
            </div>
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
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
