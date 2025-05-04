"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  MessageSquare,
  UserPlus,
  Star,
  CheckSquare,
  ArrowRight,
  Check,
  ArrowLeft,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormTemplate } from "@/types/template";
import { fetchWithAuth } from "@/lib/fetch";

export default function SelectTemplatePage() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [templates, setTemplates] = useState<FormTemplate[]>([]);

  const handleSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplateId) {
      router.push(`/dashboard/form/create/${selectedTemplateId}`);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/form-templates`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch templates");
        }

        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="bg-background w-full">
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <h1 className="text-3xl font-bold">Select a Form Template</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {templates.map((template) => (
            <Card
              key={template.formtypeid}
              className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                selectedTemplateId === template.formtypeid
                  ? "ring-2 ring-primary ring-offset-2"
                  : "border"
              }`}
              onClick={() => handleSelect(template.formtypeid)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="mt-4">{template.title}</CardTitle>

                  {selectedTemplateId === template.formtypeid && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <CardDescription className="pt-5">
                  {template.description}
                </CardDescription>
              </CardHeader>
              {/* <CardContent>
                <div className="text-sm text-muted-foreground">
                  {template.description} fields included
                </div>
              </CardContent> */}
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-8"
            onClick={handleContinue}
            disabled={!selectedTemplateId}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
