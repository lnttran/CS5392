package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/form-templates")
public class FormTemplateController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        // Create form template
        @PostMapping
        public ResponseEntity<String> createFormTemplate(@RequestBody Map<String, String> templateData) {
                String sql = "INSERT INTO FORM_TEMPLATES (formTypeID, status, title, description) " +
                                "VALUES (?, CAST(? AS form_status), ?, ?)";

                jdbcTemplate.update(sql,
                                templateData.get("formTypeId"),
                                templateData.get("status"),
                                templateData.get("title"),
                                templateData.get("description"));

                return new ResponseEntity<>("Form template created successfully", HttpStatus.CREATED);
        }

        // Get form template with content and signature templates
        @GetMapping("/{formTypeId}")
        public ResponseEntity<Map<String, Object>> getFormTemplate(@PathVariable String formTypeId) {
                String sql = "SELECT * FROM FORM_TEMPLATES WHERE formTypeID = ?";
                Map<String, Object> template = jdbcTemplate.queryForMap(sql, formTypeId);

                // Get content templates
                String contentSql = "SELECT * FROM FORM_CONTENT_TEMPLATES WHERE formTypeID = ?";
                List<Map<String, Object>> contentTemplates = jdbcTemplate.queryForList(contentSql, formTypeId);
                template.put("contentTemplates", contentTemplates);

                // Get signature templates
                String signatureSql = "SELECT * FROM SIGNATURE_TEMPLATES WHERE formTypeID = ?";
                List<Map<String, Object>> signatureTemplates = jdbcTemplate.queryForList(signatureSql, formTypeId);
                template.put("signatureTemplates", signatureTemplates);

                // Get attachment templates
                String attachmentSql = "SELECT * FROM ATTACHMENT_TEMPLATES WHERE formTypeID = ?";
                List<Map<String, Object>> attachmentTemplates = jdbcTemplate.queryForList(attachmentSql, formTypeId);
                template.put("attachmentTemplates", attachmentTemplates);

                return new ResponseEntity<>(template, HttpStatus.OK);
        }

        // Update form template
        @PutMapping("/{formTypeId}")
        public ResponseEntity<String> updateFormTemplate(@PathVariable String formTypeId,
                        @RequestBody Map<String, String> templateData) {
                String sql = "UPDATE FORM_TEMPLATES SET status = CAST(? AS form_status), title = ?, description = ? WHERE formTypeID = ?";

                jdbcTemplate.update(sql,
                                templateData.get("status"),
                                templateData.get("title"),
                                templateData.get("description"),
                                formTypeId);

                return new ResponseEntity<>("Form template updated successfully", HttpStatus.OK);
        }

        // Delete form template (cascades to related tables)
        @DeleteMapping("/{formTypeId}")
        public ResponseEntity<String> deleteFormTemplate(@PathVariable String formTypeId) {
                String sql = "DELETE FROM FORM_TEMPLATES WHERE formTypeID = ?";
                jdbcTemplate.update(sql, formTypeId);
                return new ResponseEntity<>("Form template deleted successfully", HttpStatus.NO_CONTENT);
        }

        // Get all form templates
        @GetMapping
        public ResponseEntity<List<Map<String, Object>>> getAllFormTemplates() {
                String sql = "SELECT * FROM FORM_TEMPLATES";
                List<Map<String, Object>> templates = jdbcTemplate.queryForList(sql);
                return new ResponseEntity<>(templates, HttpStatus.OK);
        }

        // Add content template
        @PostMapping("/{formTypeId}/content-templates")
        public ResponseEntity<String> addContentTemplate(@PathVariable String formTypeId,
                        @RequestBody Map<String, Object> contentData) {
                String sql = "INSERT INTO FORM_CONTENT_TEMPLATES (formTypeID, field_name, is_value_needed, value_type, description) "
                                +
                                "VALUES (?, ?, ?, CAST(? AS value_type), ?)";

                jdbcTemplate.update(sql,
                                formTypeId,
                                contentData.get("fieldName"),
                                contentData.get("isValueNeeded"),
                                contentData.get("valueType"),
                                contentData.get("description"));

                return new ResponseEntity<>("Content template added successfully", HttpStatus.CREATED);
        }

        // Add signature template
        @PostMapping("/{formTypeId}/signature-templates")
        public ResponseEntity<String> addSignatureTemplate(@PathVariable String formTypeId,
                        @RequestBody Map<String, Object> signatureData) {
                String sql = "INSERT INTO SIGNATURE_TEMPLATES (formTypeID, title_id) VALUES (?, ?)";

                jdbcTemplate.update(sql,
                                formTypeId,
                                signatureData.get("titleId") != null
                                                ? Integer.parseInt(signatureData.get("titleId").toString())
                                                : null);

                return new ResponseEntity<>("Signature template added successfully", HttpStatus.CREATED);
        }

        // Add attachment template
        @PostMapping("/{formTypeId}/attachment-templates")
        public ResponseEntity<String> addAttachmentTemplate(@PathVariable String formTypeId,
                        @RequestBody Map<String, String> attachmentData) {
                String sql = "INSERT INTO ATTACHMENT_TEMPLATES ( formTypeID, file_type) " +
                                "VALUES ( ?, CAST(? AS file_type))";

                jdbcTemplate.update(sql,
                                // attachmentData.get("attachmentTemplateId") != null
                                // ? Integer.parseInt(
                                // attachmentData.get("attachmentTemplateId").toString())
                                // : null,
                                formTypeId,
                                attachmentData.get("fileType"));

                return new ResponseEntity<>("Attachment template added successfully", HttpStatus.CREATED);
        }
}