package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import com.example.backend.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
public class FormController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Create a new form
    @PostMapping
    public ResponseEntity<String> createForm(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> formData) {
        String sql = "INSERT INTO FORMS (formID, formTypeID, username, status, created_date, last_updated) " +
                "VALUES (?, ?, ?, CAST(? AS form_status), ?, ?)";

        String formId = (String) formData.get("formId");
        String username = JwtUtil.extractUsername(token.replace("Bearer ", ""));
        try {
            jdbcTemplate.update(sql,
                    formId,
                    formData.get("formTypeId"),
                    username,
                    formData.get("status"),
                    LocalDate.now(),
                    LocalDate.now());
            return new ResponseEntity<>("Form created successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating form: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Map<String, Object>>> getAllFormsforAdmins(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        // get level of user by username
        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
        // if user is not admin, return unauthorized
        if (level != 4) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Query to get all forms, regardless of username
        String sql = "SELECT f.*, ft.title, ft.description " +
                "FROM FORMS f " +
                "JOIN FORM_TEMPLATES ft ON f.formTypeID = ft.formTypeID";

        List<Map<String, Object>> forms = jdbcTemplate.queryForList(sql);
        return new ResponseEntity<>(forms, HttpStatus.OK);
    }

    // Get form details including content, signatures, and attachments
    @GetMapping("/{formId}")
    public ResponseEntity<Map<String, Object>> getForm(@RequestHeader("Authorization") String token,
            @PathVariable String formId) {
        String username = JwtUtil.extractUsername(token.replace("Bearer ", ""));
        String sql = "SELECT f.*, ft.title, ft.description " +
                "FROM FORMS f " +
                "JOIN FORM_TEMPLATES ft ON f.formTypeID = ft.formTypeID " +
                "WHERE f.formID = ? AND f.username = ?";

        Map<String, Object> form = jdbcTemplate.queryForMap(sql, formId, username);

        // Get form content
        String contentSql = "SELECT * FROM FORM_CONTENT WHERE formID = ?";
        List<Map<String, Object>> contents = jdbcTemplate.queryForList(contentSql, formId);
        form.put("contents", contents);

        // Get signatures
        String signatureSql = "SELECT * FROM SIGNATURES WHERE formID = ?";
        List<Map<String, Object>> signatures = jdbcTemplate.queryForList(signatureSql, formId);
        form.put("signatures", signatures);

        // Get attachments
        String attachmentSql = "SELECT * FROM ATTACHMENTS WHERE formID = ?";
        List<Map<String, Object>> attachments = jdbcTemplate.queryForList(attachmentSql, formId);
        form.put("attachments", attachments);

        return new ResponseEntity<>(form, HttpStatus.OK);
    }

    // Update form status
    @PutMapping("/{formId}")
    public ResponseEntity<String> updateForm(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, String> formData) {
        String username = (String) request.getAttribute("username");
        String sql = "UPDATE FORMS SET status = CAST(? AS form_status), last_updated = ? WHERE formID = ? AND username = ?";

        jdbcTemplate.update(sql,
                formData.get("status"),
                LocalDate.now(),
                formId,
                username);

        return new ResponseEntity<>("Form updated successfully", HttpStatus.OK);
    }

    // Delete form (cascades to content, signatures, and attachments)
    @DeleteMapping("/{formId}")
    public ResponseEntity<String> deleteForm(HttpServletRequest request,
            @PathVariable String formId) {
        String username = (String) request.getAttribute("username");

        // Delete related records in dependent tables
        String deleteContentSql = "DELETE FROM FORM_CONTENT WHERE formID = ?";
        jdbcTemplate.update(deleteContentSql, formId);

        String deleteSignaturesSql = "DELETE FROM SIGNATURES WHERE formID = ?";
        jdbcTemplate.update(deleteSignaturesSql, formId);

        String deleteAttachmentsSql = "DELETE FROM ATTACHMENTS WHERE formID = ?";
        jdbcTemplate.update(deleteAttachmentsSql, formId);

        // Delete the form itself
        String deleteFormSql = "DELETE FROM FORMS WHERE formID = ? AND username = ?";
        jdbcTemplate.update(deleteFormSql, formId, username);

        return new ResponseEntity<>("Form deleted successfully", HttpStatus.OK);
    }

    // Get all forms
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllForms(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        String sql = "SELECT f.*, ft.title, ft.description " +
                "FROM FORMS f " +
                "JOIN FORM_TEMPLATES ft ON f.formTypeID = ft.formTypeID " +
                "WHERE f.username = ?";

        List<Map<String, Object>> forms = jdbcTemplate.queryForList(sql, username);
        return new ResponseEntity<>(forms, HttpStatus.OK);
    }

    // Add form content
    @PostMapping("/{formId}/content")
    public ResponseEntity<String> addFormContent(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> contentData) {
        String username = (String) request.getAttribute("username");
        // Extract contentTemplateId from request
        Integer contentTemplateId = contentData.get("contentTemplateId") != null
                ? Integer.parseInt(contentData.get("contentTemplateId").toString())
                : null;
        if (contentTemplateId == null) {
            return new ResponseEntity<>("contentTemplateId is required", HttpStatus.BAD_REQUEST);
        }

        // Check if contentTemplateId exists, if yes then delete the existing content
        String checkSql = "SELECT COUNT(*) FROM FORM_CONTENT WHERE formID = ? AND content_template_id = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, formId, contentTemplateId);
        if (count > 0) {
            String deleteSql = "DELETE FROM FORM_CONTENT WHERE formID = ? AND content_template_id = ?";
            jdbcTemplate.update(deleteSql, formId, contentTemplateId);
        }

        // Fetch the template to determine the expected value type
        String sqlTemplate = "SELECT value_type FROM form_content_templates WHERE content_template_id = ?";
        String valueType;
        try {
            valueType = jdbcTemplate.queryForObject(sqlTemplate, String.class, contentTemplateId);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid contentTemplateId", HttpStatus.BAD_REQUEST);
        }

        // Extract and cast the value based on value_type
        Object rawValue = contentData.get("fieldValue");
        if (rawValue == null) {
            return new ResponseEntity<>("fieldValue is required", HttpStatus.BAD_REQUEST);
        }
        String fieldValue;
        try {
            switch (valueType) {
                case "NUMBER":
                    fieldValue = String.valueOf(Double.parseDouble(rawValue.toString()));
                    break;
                case "TEXT":
                    if (rawValue instanceof Number || rawValue instanceof Boolean || rawValue instanceof LocalDate) {
                        return new ResponseEntity<>("Invalid fieldValue for type TEXT: " + rawValue
                                + ". Use type NUMBER if you intend to add a number, BOOLEAN if you intend to add a boolean, or DATE if you intend to add a date.",
                                HttpStatus.BAD_REQUEST);
                    }
                    fieldValue = rawValue.toString();
                    break;
                case "BOOLEAN":
                    if (rawValue instanceof Boolean) {
                        fieldValue = rawValue.toString();
                    } else {
                        return new ResponseEntity<>("Invalid fieldValue for type BOOLEAN", HttpStatus.BAD_REQUEST);
                    }
                    break;
                case "DATE":
                    try {
                        fieldValue = LocalDate.parse(rawValue.toString()).toString();
                    } catch (Exception e) {
                        return new ResponseEntity<>(
                                "Invalid fieldValue for type DATE. Please use ISO format (e.g., '2025-03-22').",
                                HttpStatus.BAD_REQUEST);
                    }
                    break;
                default:
                    return new ResponseEntity<>("Unsupported value_type: " + valueType, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid fieldValue for type " + valueType + ": " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
        }

        // Insert into form_content
        String sql = "INSERT INTO FORM_CONTENT (formID, field_value, content_template_id) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(sql, formId, fieldValue, contentTemplateId);
            return new ResponseEntity<>("Form content added successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error adding form content: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add signature
    @PostMapping("/{formId}/signatures")
    public ResponseEntity<String> addSignature(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> signatureData) {
        String username = (String) request.getAttribute("username");

        // Fetch user details
        String userSql = "SELECT firstname, lastname, title_id FROM USERS WHERE username = ?";
        Map<String, Object> user;
        try {
            user = jdbcTemplate.queryForMap(userSql, username);
        } catch (Exception e) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Extract and validate the entered signature
        String signature = (String) signatureData.get("signature");
        String[] nameParts = signature.split(" ");
        if (nameParts.length < 2) {
            return new ResponseEntity<>("Invalid signature format. Please provide both first name and last name.",
                    HttpStatus.BAD_REQUEST);
        }
        String enteredFirstName = nameParts[0];
        String enteredLastName = nameParts[1];
        Integer enteredTitleId = signatureData.get("titleId") != null
                ? Integer.parseInt(signatureData.get("titleId").toString())
                : null;

        if (!user.get("firstname").equals(enteredFirstName) || !user.get("lastname").equals(enteredLastName)
                || !user.get("title_id").equals(enteredTitleId)) {
            return new ResponseEntity<>(
                    "Signature validation failed: First name, last name, or title ID does not match",
                    HttpStatus.BAD_REQUEST);
        }

        // Validate titleID from signature template
        Integer signatureTemplateId = signatureData.get("signatureTemplateId") != null
                ? Integer.parseInt(signatureData.get("signatureTemplateId").toString())
                : null;
        if (signatureTemplateId == null) {
            return new ResponseEntity<>("signatureTemplateId is required", HttpStatus.BAD_REQUEST);
        }

        String templateSql = "SELECT title_id FROM signature_templates WHERE signature_template_id = ?";
        Integer templateTitleId;
        try {
            templateTitleId = jdbcTemplate.queryForObject(templateSql, Integer.class, signatureTemplateId);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid signatureTemplateId", HttpStatus.BAD_REQUEST);
        }

        if (!user.get("title_id").equals(templateTitleId) || !templateTitleId.equals(enteredTitleId)) {
            return new ResponseEntity<>(
                    "Signature validation failed: Title ID mismatch with the requirements",
                    HttpStatus.BAD_REQUEST);
        }

        // Insert the signature
        String sql = "INSERT INTO SIGNATURES (signature_template_id, formID, username, signature, decided_on, status, rejection_reason, title_id) "
                +
                "VALUES (?, ?, ?, ?, ?, CAST(? AS form_status), ?, ?)";

        jdbcTemplate.update(sql,
                signatureTemplateId,
                formId,
                username,
                signature,
                signatureData.get("decidedOn") != null ? LocalDate.parse(signatureData.get("decidedOn").toString())
                        : null,
                signatureData.get("status"),
                signatureData.get("rejectionReason"),
                enteredTitleId);

        return new ResponseEntity<>("Signature added successfully", HttpStatus.CREATED);
    }

    // Add attachment
    @PostMapping("/{formId}/attachments")
    public ResponseEntity<String> addAttachment(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> attachmentData) {
        String username = (String) request.getAttribute("username");
        String sql = "INSERT INTO ATTACHMENTS (formID, file_path, attatchment_template_id) " +
                "VALUES (?, ?, ?)";

        jdbcTemplate.update(sql,
                formId,
                attachmentData.get("filePath"),
                attachmentData.get("attachmentTemplateId") != null
                        ? Integer.parseInt(attachmentData.get("attachmentTemplateId").toString())
                        : null);

        return new ResponseEntity<>("Attachment added successfully", HttpStatus.CREATED);
    }
}