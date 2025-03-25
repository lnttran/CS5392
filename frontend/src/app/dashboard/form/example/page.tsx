"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

// Mock data for the form template
const formTemplate = {
  id: "FT001",
  title: "Graduation Application Form",
  description:
    "Use this form to apply for graduation. It requires approval from your advisor, department chair, and the dean.",
  fields: [
    { id: "major", label: "Major", type: "text" },
    { id: "gpa", label: "Current GPA", type: "number" },
    { id: "graduationDate", label: "Expected Graduation Date", type: "date" },
    { id: "comments", label: "Additional Comments", type: "textarea" },
  ],
  signatures: [
    { level: 1, title: "Academic Advisor" },
    { level: 2, title: "Department Chair" },
    { level: 3, title: "Dean" },
  ],
};

export default function FillForm() {
  const { formId } = useParams();
  const [formData, setFormData] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the form data to your backend
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{formTemplate.title}</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Header</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Form ID:</strong> {formTemplate.id}
            </p>
            <p>
              <strong>Description:</strong> {formTemplate.description}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                name="studentId"
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Contents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formTemplate.fields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    name={field.id}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    onChange={handleInputChange}
                    required
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formTemplate.signatures.map((signature, index) => (
                  <TableRow key={index}>
                    <TableCell>{signature.level}</TableCell>
                    <TableCell>{signature.title}</TableCell>
                    <TableCell>Pending</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Applicant Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
              /> */}
              <label
                htmlFor="agreeToTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that all the information provided is accurate and
                complete.
              </label>
            </div>
            <div>
              <Label htmlFor="signature">Full Name (as signature)</Label>
              <Input
                id="signature"
                name="signature"
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button
            type="submit"
            // disabled={!agreeToTerms}
            className="bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]"
          >
            Submit Form
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
