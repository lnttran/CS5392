package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/form-templates")
public class FormTemplateController {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        // Create form template
        @PostMapping
        public ResponseEntity<Map<String, Object>> createFormTemplateWithTemplates(HttpServletRequest request,
                        @RequestBody Map<String, Object> data) {
                Map<String, Object> result = new HashMap<>();
                List<String> contentErrors = new ArrayList<>();
                List<String> signatureErrors = new ArrayList<>();
                List<String> attachmentErrors = new ArrayList<>();

                try {
                        String username = (String) request.getAttribute("username");
                        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
                        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
                        if (level != 4) {
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(Map.of("error", "Unauthorized"));
                        }

                        String formTypeId = (String) data.get("formtypeid");
                        String status = (String) data.get("status");
                        String title = (String) data.get("title");
                        String description = (String) data.get("description");

                        // Insert into FORM_TEMPLATES
                        String formSql = "INSERT INTO FORM_TEMPLATES (formTypeID, status, title, description) " +
                                        "VALUES (?, CAST(? AS form_status), ?, ?)";
                        jdbcTemplate.update(formSql, formTypeId, status, title, description);
                        result.put("formTemplate", "Created");

                        // --- Content Templates ---
                        List<Map<String, Object>> contentTemplates = (List<Map<String, Object>>) data
                                        .get("contentTemplates");
                        if (contentTemplates != null) {
                                for (Map<String, Object> ct : contentTemplates) {
                                        try {
                                                String contentSql = "INSERT INTO FORM_CONTENT_TEMPLATES (formTypeID, field_name, is_value_needed, value_type, description) "
                                                                +
                                                                "VALUES (?, ?, ?, CAST(? AS value_type), ?)";
                                                jdbcTemplate.update(contentSql,
                                                                formTypeId,
                                                                ct.get("field_name"),
                                                                ct.get("is_value_needed"),
                                                                ct.get("value_type"),
                                                                ct.get("description"));
                                        } catch (Exception e) {
                                                contentErrors.add("Failed to insert field: " + ct.get("field_name")
                                                                + " - " + e.getMessage());
                                        }
                                }
                        }

                        // --- Signature Templates ---
                        List<Map<String, Object>> signatureTemplates = (List<Map<String, Object>>) data
                                        .get("signatureTemplates");
                        if (signatureTemplates != null) {
                                for (Map<String, Object> st : signatureTemplates) {
                                        try {
                                                Object titleIdObj = st.get("title_id");
                                                Integer titleId = titleIdObj != null
                                                                ? Integer.parseInt(titleIdObj.toString())
                                                                : null;

                                                // Validate title_id
                                                if (titleId != null) {
                                                        String checkSql = "SELECT COUNT(*) FROM USER_TITLES WHERE title_id = ?";
                                                        Integer count = jdbcTemplate.queryForObject(checkSql,
                                                                        Integer.class, titleId);
                                                        if (count == null || count == 0) {
                                                                signatureErrors.add("titleId not found: " + titleId);
                                                                continue;
                                                        }
                                                }

                                                String sigSql = "INSERT INTO SIGNATURE_TEMPLATES (formTypeID, title_id) VALUES (?, ?)";
                                                jdbcTemplate.update(sigSql, formTypeId, titleId);
                                        } catch (Exception e) {
                                                signatureErrors.add("Error inserting signature: " + e.getMessage());
                                        }
                                }
                        }

                        // --- Attachment Templates ---
                        List<Map<String, String>> attachmentTemplates = (List<Map<String, String>>) data
                                        .get("attachmentTemplates");
                        if (attachmentTemplates != null) {
                                for (Map<String, String> at : attachmentTemplates) {
                                        try {
                                                String attSql = "INSERT INTO ATTACHMENT_TEMPLATES (formTypeID, description, file_type, is_required) "
                                                                +
                                                                "VALUES (?, ?, CAST(? AS file_type), ?)";
                                                jdbcTemplate.update(
                                                                attSql,
                                                                formTypeId,
                                                                at.get("description"),
                                                                at.get("file_type"),
                                                                at.get("is_required"));
                                        } catch (Exception e) {
                                                attachmentErrors.add(
                                                                "Error inserting attachment (fileType: "
                                                                                + at.get("file_type") + ") - "
                                                                                + e.getMessage());
                                        }
                                }
                        }

                        // Collect final result
                        result.put("contentTemplates", contentErrors.isEmpty() ? "All inserted" : contentErrors);
                        result.put("signatureTemplates", signatureErrors.isEmpty() ? "All inserted" : signatureErrors);
                        result.put("attachmentTemplates",
                                        attachmentErrors.isEmpty() ? "All inserted" : attachmentErrors);

                        return ResponseEntity.status(HttpStatus.CREATED).body(result);
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        // public ResponseEntity<String> createFormTemplate(HttpServletRequest request,
        // @RequestBody Map<String, String> templateData) {
        // try {
        // String username = (String) request.getAttribute("username");
        // // Get level of user by username
        // String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
        // int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
        // // If user is not admin, return unauthorized
        // if (level != 4) {
        // return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        // }

        // String sql = "INSERT INTO FORM_TEMPLATES (formTypeID, status, title,
        // description) " +
        // "VALUES (?, CAST(? AS form_status), ?, ?)";

        // jdbcTemplate.update(sql,
        // templateData.get("formTypeId"),
        // templateData.get("status"),
        // templateData.get("title"),
        // templateData.get("description"));

        // return new ResponseEntity<>("Form template created successfully",
        // HttpStatus.CREATED);
        // } catch (Exception e) {
        // return new ResponseEntity<>(e.getMessage(),
        // HttpStatus.INTERNAL_SERVER_ERROR);
        // }
        // }

        // Get form template with content and signature templates
        @GetMapping("/{formTypeId}")
        public ResponseEntity<Map<String, Object>> getFormTemplate(@PathVariable String formTypeId) {
                try {
                        String sql = "SELECT * FROM FORM_TEMPLATES WHERE formTypeID = ?";
                        Map<String, Object> template = jdbcTemplate.queryForMap(sql, formTypeId);

                        // Get content templates
                        String contentSql = "SELECT * FROM FORM_CONTENT_TEMPLATES WHERE formTypeID = ?";
                        List<Map<String, Object>> contentTemplates = jdbcTemplate.queryForList(contentSql, formTypeId);
                        template.put("contentTemplates", contentTemplates);

                        // Get signature templates
                        String signatureSql = "SELECT * FROM SIGNATURE_TEMPLATES WHERE formTypeID = ?";
                        List<Map<String, Object>> signatureTemplates = jdbcTemplate.queryForList(signatureSql,
                                        formTypeId);
                        template.put("signatureTemplates", signatureTemplates);

                        // Get attachment templates
                        String attachmentSql = "SELECT * FROM ATTACHMENT_TEMPLATES WHERE formTypeID = ?";
                        List<Map<String, Object>> attachmentTemplates = jdbcTemplate.queryForList(attachmentSql,
                                        formTypeId);
                        template.put("attachmentTemplates", attachmentTemplates);

                        return new ResponseEntity<>(template, HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        // Update form template
        @PutMapping("/{formTypeId}")
        public ResponseEntity<String> updateFormTemplate(HttpServletRequest request, @PathVariable String formTypeId,
                        @RequestBody Map<String, String> templateData) {
                try {
                        String username = (String) request.getAttribute("username");
                        // Get level of user by username
                        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
                        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
                        // If user is not admin, return unauthorized
                        if (level != 4) {
                                return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
                        }

                        String sql = "UPDATE FORM_TEMPLATES SET status = CAST(? AS form_status), title = ?, description = ? WHERE formTypeID = ?";

                        jdbcTemplate.update(sql,
                                        templateData.get("status"),
                                        templateData.get("title"),
                                        templateData.get("description"),
                                        formTypeId);

                        return new ResponseEntity<>("Form template updated successfully", HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        @PostMapping("/{formTypeId}/archive")
        public ResponseEntity<String> archiveFormTemplate(HttpServletRequest request, @PathVariable String formTypeId) {
                try {
                        String username = (String) request.getAttribute("username");

                        // Check admin level
                        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
                        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
                        if (level != 4) {
                                return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
                        }

                        // Update status to INACTIVE
                        String sql = "UPDATE FORM_TEMPLATES SET status = 'INACTIVE' WHERE formTypeID = ?";
                        jdbcTemplate.update(sql, formTypeId);

                        return new ResponseEntity<>("Form template archived successfully", HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        @PostMapping("/{formTypeId}/unarchive")
        public ResponseEntity<String> unarchiveFormTemplate(HttpServletRequest request,
                        @PathVariable String formTypeId) {
                try {
                        String username = (String) request.getAttribute("username");

                        // Check admin level
                        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
                        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
                        if (level != 4) {
                                return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
                        }

                        // Update status back to ACTIVE
                        String sql = "UPDATE FORM_TEMPLATES SET status = 'ACTIVE' WHERE formTypeID = ?";
                        jdbcTemplate.update(sql, formTypeId);

                        return new ResponseEntity<>("Form template unarchived successfully", HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        // Delete form template (cascades to related tables)
        @DeleteMapping("/{formTypeId}")
        public ResponseEntity<String> deleteFormTemplate(HttpServletRequest request, @PathVariable String formTypeId) {
                try {
                        String username = (String) request.getAttribute("username");
                        // Get level of user by username
                        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
                        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
                        // If user is not admin, return unauthorized
                        if (level != 4) {
                                return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
                        }

                        // Delete dependent records in SIGNATURE_TEMPLATES table
                        String deleteSignatureTemplatesSql = "DELETE FROM SIGNATURE_TEMPLATES WHERE formTypeID = ?";
                        jdbcTemplate.update(deleteSignatureTemplatesSql, formTypeId);

                        // Delete dependent records in FORM_CONTENT_TEMPLATES table
                        String deleteContentTemplatesSql = "DELETE FROM FORM_CONTENT_TEMPLATES WHERE formTypeID = ?";
                        jdbcTemplate.update(deleteContentTemplatesSql, formTypeId);

                        // Delete dependent records in ATTACHMENT_TEMPLATES table
                        String deleteAttachmentTemplatesSql = "DELETE FROM ATTACHMENT_TEMPLATES WHERE formTypeID = ?";
                        jdbcTemplate.update(deleteAttachmentTemplatesSql, formTypeId);

                        // Delete dependent records in FORMS table
                        // Find list of formIDs that have the given formTypeID
                        String findFormsSql = "SELECT formID FROM FORMS WHERE formTypeID = ?";
                        List<Map<String, Object>> formIds = jdbcTemplate.queryForList(findFormsSql, formTypeId);

                        for (Map<String, Object> form : formIds) {
                                String formId = form.get("formID").toString();

                                String deleteContentSql = "DELETE FROM FORM_CONTENT WHERE formID = ?";
                                jdbcTemplate.update(deleteContentSql, formId);

                                String deleteSignaturesSql = "DELETE FROM SIGNATURES WHERE formID = ?";
                                jdbcTemplate.update(deleteSignaturesSql, formId);

                                String deleteAttachmentsSql = "DELETE FROM ATTACHMENTS WHERE formID = ?";
                                jdbcTemplate.update(deleteAttachmentsSql, formId);
                        }

                        // Delete dependent records in FORMS table
                        String deleteFormsSql = "DELETE FROM FORMS WHERE formTypeID = ?";
                        jdbcTemplate.update(deleteFormsSql, formTypeId);

                        // Delete the form template
                        String deleteFormTemplateSql = "DELETE FROM FORM_TEMPLATES WHERE formTypeID = ?";
                        jdbcTemplate.update(deleteFormTemplateSql, formTypeId);

                        return new ResponseEntity<>("Form template deleted successfully", HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
                }
        }

        // Get all form templates
        @GetMapping
        public ResponseEntity<List<Map<String, Object>>> getAllFormTemplates(HttpServletRequest request) {

                String sql = "SELECT * FROM FORM_TEMPLATES";
                List<Map<String, Object>> templates = jdbcTemplate.queryForList(sql);
                return new ResponseEntity<>(templates, HttpStatus.OK);

        }

        // // Add content template
        // @PostMapping("/{formTypeId}/content-templates")
        // public ResponseEntity<String> addContentTemplate(@PathVariable String
        // formTypeId,
        // @RequestBody Map<String, Object> contentData) {
        // String sql = "INSERT INTO FORM_CONTENT_TEMPLATES (formTypeID, field_name,
        // is_value_needed, value_type, description) "
        // +
        // "VALUES (?, ?, ?, CAST(? AS value_type), ?)";

        // jdbcTemplate.update(sql,
        // formTypeId,
        // contentData.get("fieldName"),
        // contentData.get("isValueNeeded"),
        // contentData.get("valueType"),
        // contentData.get("description"));

        // return new ResponseEntity<>("Content template added successfully",
        // HttpStatus.CREATED);
        // }

        // // Add signature template
        // @PostMapping("/{formTypeId}/signature-templates")
        // public ResponseEntity<String> addSignatureTemplate(@PathVariable String
        // formTypeId,
        // @RequestBody Map<String, Object> signatureData) {
        // String sql = "INSERT INTO SIGNATURE_TEMPLATES (formTypeID, title_id) VALUES
        // (?, ?)";

        // jdbcTemplate.update(sql,
        // formTypeId,
        // signatureData.get("titleId") != null
        // ? Integer.parseInt(signatureData.get("titleId").toString())
        // : null);

        // return new ResponseEntity<>("Signature template added successfully",
        // HttpStatus.CREATED);
        // }

        // // Add attachment template
        // @PostMapping("/{formTypeId}/attachment-templates")
        // public ResponseEntity<String> addAttachmentTemplate(@PathVariable String
        // formTypeId,
        // @RequestBody Map<String, String> attachmentData) {
        // String sql = "INSERT INTO ATTACHMENT_TEMPLATES ( formTypeID, file_type) " +
        // "VALUES ( ?, CAST(? AS file_type))";

        // jdbcTemplate.update(sql,
        // // attachmentData.get("attachmentTemplateId") != null
        // // ? Integer.parseInt(
        // // attachmentData.get("attachmentTemplateId").toString())
        // // : null,
        // formTypeId,
        // attachmentData.get("fileType"));

        // return new ResponseEntity<>("Attachment template added successfully",
        // HttpStatus.CREATED);
        // }
}