import { fetchWithAuth } from "@/lib/fetch";
import { AttachmentTemplateJS, FormStatus } from "./template";

export interface Form {
  created_date: string;
  description: string;
  formid: string;
  formtypeid: string;
  last_updated: string;
  status: string;
  title: string;
  username: string;
  next_signer_level: string;
}

export interface Attachment {
  attachment_template_id: string;
  attachmentid: number;
  file_content: string;
  formid: string;
}

export interface Content {
  content_id: number;
  content_template_id: number;
  field_value: string;
  formid: string;
}

export interface Signature {
  decided_on: string | null;
  formid: string;
  rejection_reason: string | null;
  signature: string | null;
  signature_template_id: number;
  signatureid: number;
  status: FormStatus;
  title_id: number | null;
  username: string;
}

export interface SignApplication {
  signature_template_id: number;
  signatureid: number;
  decided_on: string;
  signature: string;
  rejection_reason: string | null;
  status: FormStatus;
  title_id: string;
}

export interface FormDetails extends Form {
  contents: Content[];
  signatures: Signature[];
  attachments: Attachment[];
}

export interface FormWithSignatureStatus extends Form {
  signature_status: FormStatus;
}

export async function generateUniqueApplicationId(
  formtypeid: string
): Promise<string> {
  const datePart = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  let attempt = 0;
  let applicationId: string;
  let exists = true;

  while (exists && attempt < 5) {
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    applicationId = `${formtypeid}-${datePart}-${randomPart}`;

    // Call backend to check existence
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/exists/${applicationId}`,
      { method: "GET", credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to check application ID existence");

    const idExists = await res.json();
    exists = idExists === true;
    attempt++;
  }

  if (exists)
    throw new Error(
      "Unable to generate a unique Application ID after 5 attempts"
    );
  return applicationId!;
}
