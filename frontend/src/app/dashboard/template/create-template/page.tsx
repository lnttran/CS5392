"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
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

export default function CreateFormTemplate() {
  const [formFields, setFormFields] = useState<string[]>([""]);
  const [signatures, setSignatures] = useState<
    { level: string; title: string }[]
  >([{ level: "", title: "" }]);

  const addFormField = () => {
    setFormFields([...formFields, ""]);
  };

  const removeFormField = (index: number) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  const addSignature = () => {
    setSignatures([...signatures, { level: "", title: "" }]);
  };

  const removeSignature = (index: number) => {
    const newSignatures = [...signatures];
    newSignatures.splice(index, 1);
    setSignatures(newSignatures);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted");
  };

  return (
    <div className="container mx-auto p-6 w-[80vw]">
      <h1 className="text-3xl font-bold mb-6">Create New Form Template</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formTypeId">Form Type ID</Label>
              <Input
                id="formTypeId"
                placeholder="Enter a unique identifier"
                required
              />
            </div>
            <div>
              <Label htmlFor="formTitle">Form Title</Label>
              <Input
                id="formTitle"
                placeholder="Enter the form title"
                required
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Form Description</Label>
              {/* <Textarea id="formDescription" placeholder="Enter a brief description of the form" required /> */}
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
            {formFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Field ${index + 1}`}
                  value={field}
                  onChange={(e) => {
                    const newFields = [...formFields];
                    newFields[index] = e.target.value;
                    setFormFields(newFields);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeFormField(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addFormField}
              className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signatures.map((signature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  value={signature.level}
                  onValueChange={(value) => {
                    const newSignatures = [...signatures];
                    newSignatures[index].level = value;
                    setSignatures(newSignatures);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Title (e.g., Instructor, Dean)"
                  value={signature.title}
                  onChange={(e) => {
                    const newSignatures = [...signatures];
                    newSignatures[index].title = e.target.value;
                    setSignatures(newSignatures);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSignature(index)}
                >
                  <Trash className="h-4 w-4" />
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
