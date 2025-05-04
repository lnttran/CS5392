// Enum types matching your PostgreSQL ENUMs
export type ValueType = "NUMBER" | "TEXT" | "BOOLEAN" | "DATE";
export type FileType = "PDF" | "DOC" | "JPG" | "PNG";
export type FormStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE"
  | "ACTIVE";

// Content template structure
export interface ContentTemplate {
  field_name: string;
  is_value_needed: boolean;
  value_type: ValueType;
  description?: string;
}

export interface ContentTemplateJS extends ContentTemplate {
  content_template_id: number;
  formtypeid: string;
}

// Signature template structure
export interface SignatureTemplate {
  title_id: string;
}

export interface SignatureTemplateJS extends SignatureTemplate {
  formtypeid: string;
  signature_template_id: number;
}

// Attachment template structure
export interface AttachmentTemplate {
  description: string;
  file_type: FileType;
}

export interface AttachmentTemplateJS extends AttachmentTemplate {
  formtypeid: string;
  attachment_template_id: number;
}

// Main form template structure for POST request
export interface FormTemplateWithContents {
  formTypeId: string;
  status: FormStatus;
  title: string;
  description: string;
  contentTemplates: ContentTemplate[];
  signatureTemplates: SignatureTemplate[];
  attachmentTemplates?: AttachmentTemplate[];
}
export interface FormTemplate {
  formtypeid: string;
  status: FormStatus;
  title: string;
  description: string;
}
