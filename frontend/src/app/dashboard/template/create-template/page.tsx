"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  AttachmentTemplate,
  ContentTemplate,
  FileType,
  SignatureTemplate,
  ValueType,
} from "@/types/template";
import { Title } from "@/types/title";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch";

export default function CreateFormTemplate() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);
  const [content, setContent] = useState<ContentTemplate[]>([]);
  const [attachments, setAttachments] = useState<AttachmentTemplate[]>([]);
  const [signatures, setSignatures] = useState<SignatureTemplate[]>([]);
  const [formtypeid, setformtypeid] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const addFormField = () => {
    setContent([
      ...content,
      {
        field_name: "",
        is_value_needed: true,
        value_type: "TEXT", // must match your enum
        description: "",
      },
    ]);
  };

  const removeFormField = (index: number) => {
    const newFields = [...content];
    newFields.splice(index, 1);
    setContent(newFields);
  };

  const addSignature = () => {
    setSignatures([
      ...signatures,
      {
        title_id: "1", // default ID, can be adjusted with UI
      },
    ]);
  };

  const removeSignature = (index: number) => {
    const newSignatures = [...signatures];
    newSignatures.splice(index, 1);
    setSignatures(newSignatures);
  };

  const addAttachment = () => {
    setAttachments([
      ...attachments,
      {
        description: "",
        file_type: "PDF", // default to one valid file_type
        is_required: true,
      },
    ]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const fetchTitles = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data, "titles");
        setTitles(data);
      } else {
        toast.error("Failed to fetch titles");
      }
    } catch (error) {
      toast.error("Failed to fetch titles");
    }
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formtypeid || !formTitle || !formDescription) {
      toast.error("Please fill in the form header fields.");
      return;
    }

    // Validate content fields
    for (const [i, field] of content.entries()) {
      if (!field.field_name.trim()) {
        toast.error(`Field name is required in content field #${i + 1}`);
        return;
      }
      if (field.is_value_needed && !field.value_type) {
        toast.error(`Value type is required in content field #${i + 1}`);
        return;
      }
    }

    // Validate attachments
    for (const [i, attachment] of attachments.entries()) {
      if (!attachment.file_type) {
        toast.error(`File type is required for attachment #${i + 1}`);
        return;
      }
    }

    // Validate signatures
    for (const [i, signature] of signatures.entries()) {
      if (!signature.title_id || signature.title_id === "") {
        toast.error(`Title ID is required for signature #${i + 1}`);
        return;
      }
    }

    const payload = {
      formtypeid,
      status: "ACTIVE",
      title: formTitle,
      description: formDescription,
      contentTemplates: content.map((field) => ({
        field_name: field.field_name,
        is_value_needed: field.is_value_needed,
        value_type: field.value_type.toUpperCase(), // must match ENUM
        description: field.description,
      })),
      attachmentTemplates: attachments.map((att) => ({
        file_type: att.file_type.toUpperCase(),
        description: att.description,
        is_required: att.is_required,
      })),
      signatureTemplates: signatures.map((sig) => ({
        title_id: Number(sig.title_id), // ensure it's a number
      })),
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/form-templates`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setContent([]);
        setAttachments([]);
        setSignatures([]);
        setformtypeid("");
        setFormTitle("");
        setFormDescription("");
        toast("Form Template created successfully!");
        router.back();
      } else {
        console.error("Error:", data);
        toast.error("Failed to create form template.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong.");
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
        <h1 className="text-3xl font-bold">Create New Form Template</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formtypeid">Form Type ID</Label>
              <Input
                id="formtypeid"
                placeholder="Enter a unique identifier"
                required
                value={formtypeid}
                onChange={(e) => setformtypeid(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formTitle">Form Title</Label>
              <Input
                id="formTitle"
                placeholder="Enter the form title"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Form Description</Label>
              <Textarea
                id="formDescription"
                placeholder="Enter a brief description of the form"
                required
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Contents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.map((field, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={`Field ${index + 1}`}
                      value={field.field_name}
                      onChange={(e) => {
                        const newFields = [...content];
                        newFields[index].field_name = e.target.value;
                        setContent(newFields);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">
                      Required:
                    </Label>
                    <Select
                      value={field.is_value_needed ? "yes" : "no"}
                      onValueChange={(value) => {
                        const newFields = [...content];
                        newFields[index].is_value_needed = value === "yes";
                        setContent(newFields);
                      }}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Type:</Label>
                    <Select
                      value={field.value_type}
                      onValueChange={(value) => {
                        const newFields = [...content];
                        newFields[index].value_type = value as ValueType;
                        setContent(newFields);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="BOOLEAN">True/False</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFormField(index)}
                    className="h-9 w-9"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {/* Optional description input */}
                <Input
                  placeholder="Description (optional)"
                  value={field.description}
                  onChange={(e) => {
                    const newFields = [...content];
                    newFields[index].description = e.target.value;
                    setContent(newFields);
                  }}
                  className="mt-1"
                />
              </div>
            ))}
            <Button
              type="button"
              onClick={addFormField}
              className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC] hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={`Attachment ${index + 1}`}
                      value={attachment.description}
                      onChange={(e) => {
                        const newAttachments = [...attachments];
                        newAttachments[index].description = e.target.value;
                        setAttachments(newAttachments);
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">
                      Allowed Types:
                    </Label>
                    <Select
                      value={attachment.file_type}
                      onValueChange={(value) => {
                        const newAttachments = [...attachments];
                        newAttachments[index].file_type = value as FileType;
                        setAttachments(newAttachments);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOC">DOC</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                        <SelectItem value="PNG">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">
                      Required:
                    </Label>
                    <Select
                      value={attachment.is_required ? "yes" : "no"}
                      onValueChange={(value) => {
                        const newAttachments = [...attachments];
                        newAttachments[index].is_required = value === "yes";
                        setAttachments(newAttachments);
                      }}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttachment(index)}
                    className="h-9 w-9"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={addAttachment}
              className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC] hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Attachment
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signatures.map((signature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50"
              >
                <Select
                  value={signature.title_id}
                  onValueChange={(value) => {
                    const newSignatures = [...signatures];
                    newSignatures[index].title_id = value;
                    setSignatures(newSignatures);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
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

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSignature(index)}
                  className="h-9 w-9"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addSignature}
              className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Signature
            </Button>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
        >
          Create Form Template
        </Button>
      </form>
    </div>
  );
}
