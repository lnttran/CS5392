"use client";

import { useEffect, useState } from "react";
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

export default function TemplateExample() {
  const router = useRouter();
  const params = useParams();
  const rawFormtypeid = params.formtypeid;
  const formtypeid = Array.isArray(rawFormtypeid)
    ? rawFormtypeid[0]
    : rawFormtypeid;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  // go through signaturetemplates and get the title
  const fetchSignatureTitles = async () => {
    try {
      const titles = await Promise.all(
        signatureTemplates.map(async (sig) => {
          const title = await fetchTitleById(sig.title_id);
          return title || "";
        })
      );
      setSignatureTitles(titles);
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
    if (!formtypeid) return;

    fetchTemplate();
  }, [formtypeid]);

  useEffect(() => {
    if (signatureTemplates.length > 0) {
      fetchSignatureTitles();
    }
  }, [signatureTemplates]);

  const [formValues, setFormValues] = useState<
    Record<string, string | boolean>
  >({});
  const [applicantInfo, setApplicantInfo] = useState({
    level: "",
    firstName: "",
    lastName: "",
    title: "",
    formId: "",
  });
  const [signatureInfo, setSignatureInfo] = useState({
    signature: "",
    dateSigned: new Date().toISOString().split("T")[0],
  });
  const [signerInfo, setSignerInfo] = useState<
    Record<
      string,
      {
        firstName: string;
        lastName: string;
        signature: string;
        dateSigned: string;
      }
    >
  >({});

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSignatureInfoChange = (field: string, value: string) => {
    setSignatureInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignerInfoChange = (
    signerId: string,
    field: string,
    value: string
  ) => {
    setSignerInfo((prev) => ({
      ...prev,
      [signerId]: {
        ...(prev[signerId] || {
          firstName: "",
          lastName: "",
          signature: "",
          dateSigned: new Date().toISOString().split("T")[0],
        }),
        [field]: value,
      },
    }));
  };

  const renderInputField = (field: {
    name: string;
    valueType: string;
    require: boolean;
  }) => {
    switch (field.valueType) {
      case "TEXT":
        return (
          <Input
            type="text"
            placeholder={`Enter ${field.name}`}
            value={(formValues[field.name] as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="flex-1 w-full"
            required={field.require}
          />
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.name}`}
            value={(formValues[field.name] as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="flex-1 w-full"
            required={field.require}
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={(formValues[field.name] as boolean) || false}
              onCheckedChange={(checked) =>
                handleInputChange(field.name, checked as boolean)
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
        <h1 className="text-3xl font-bold">Form Template</h1>
      </div>

      {/* Header Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Template ID</p>
              <p className="text-lg">{formtypeid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="text-lg">{title}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-md">{description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Information */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level </Label>
              <Select
                value={applicantInfo.level}
                onValueChange={(value) =>
                  handleApplicantInfoChange("level", value)
                }
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title </Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={applicantInfo.title}
                onChange={(e) =>
                  handleApplicantInfoChange("title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name </Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={applicantInfo.firstName}
                onChange={(e) =>
                  handleApplicantInfoChange("firstName", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={applicantInfo.lastName}
                onChange={(e) =>
                  handleApplicantInfoChange("lastName", e.target.value)
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="formId">Form ID </Label>
              <Input
                id="formId"
                placeholder="Enter form ID"
                value={applicantInfo.formId}
                onChange={(e) =>
                  handleApplicantInfoChange("formId", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card> */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">
            This section will automatically include fields for the applicant's
            name and level.
          </p>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {contentTemplates.map(
              (field, index) =>
                //filter out the fields that does not has description
                !field.description && (
                  <div
                    key={index}
                    className="flex items-center p-2 gap-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {field.field_name}
                        {field.is_value_needed && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>

                      {/* {field.description && (
                    <span className="text-sm text-gray-500">
                      : {field.description}
                    </span>
                  )} */}
                    </div>
                    <div className="flex-1 items-center gap-4">
                      {renderInputField({
                        name: field.field_name,
                        valueType: field.value_type,
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
                //filter out the fields that does not has description
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
                    <div className="flex items-center gap-4">
                      {renderInputField({
                        name: field.field_name,
                        valueType: field.value_type,
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
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{attachment.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {attachment.file_type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {signatureTemplates.map((signature, index) => {
              const signerId = `signer-${signature.signature_template_id}`;
              const signer = signerInfo[signerId] || {
                firstName: "",
                lastName: "",
                signature: "",
                dateSigned: new Date().toISOString().split("T")[0],
              };

              return (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {signatureTitles[index]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${signerId}-firstName`}>
                        First Name{" "}
                      </Label>
                      <Input
                        id={`${signerId}-firstName`}
                        placeholder="Enter first name"
                        value={signer.firstName}
                        onChange={(e) =>
                          handleSignerInfoChange(
                            signerId,
                            "firstName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${signerId}-lastName`}>Last Name </Label>
                      <Input
                        id={`${signerId}-lastName`}
                        placeholder="Enter last name"
                        value={signer.lastName}
                        onChange={(e) =>
                          handleSignerInfoChange(
                            signerId,
                            "lastName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${signerId}-signature`}>
                        Signature{" "}
                      </Label>
                      <Input
                        id={`${signerId}-signature`}
                        placeholder="Enter signature"
                        value={signer.signature}
                        onChange={(e) =>
                          handleSignerInfoChange(
                            signerId,
                            "signature",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${signerId}-dateSigned`}>
                        Date Signed{" "}
                      </Label>
                      <Input
                        id={`${signerId}-dateSigned`}
                        type="date"
                        value={signer.dateSigned}
                        onChange={(e) =>
                          handleSignerInfoChange(
                            signerId,
                            "dateSigned",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor={`${signerId}-signature`}>Signature </Label>
                    <div className="border rounded-md p-4 h-24 flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500 text-center">
                        {signer.firstName && signer.lastName 
                          ? `${signer.firstName} ${signer.lastName}`
                          : "Signature will appear here"}
                      </p>
                    </div>
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label htmlFor={`${signerId}-dateSigned`}>Date Signed </Label>
                    <Input
                      id={`${signerId}-dateSigned`}
                      type="date"
                      value={signer.dateSigned}
                      onChange={(e) => handleSignerInfoChange(signerId, "dateSigned", e.target.value)}
                      className="w-full"
                    />
                  </div> */}
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
            <div className="space-y-2">
              <Label htmlFor="signature">Signature </Label>
              <div className="border rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-center">
                  {applicantInfo.firstName && applicantInfo.lastName
                    ? `${applicantInfo.firstName} ${applicantInfo.lastName}`
                    : "Your signature will appear here"}
                </p>
              </div>
            </div>
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
          onClick={() => router.push("/dashboard/template/create-template")}
        >
          Create New Template
        </Button>
      </div>
    </div>
  );
}
