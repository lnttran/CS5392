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
    public ResponseEntity<String> createForm(HttpServletRequest request,
            @RequestBody Map<String, Object> formData) {
        String sql = "INSERT INTO FORMS (formid, formtypeid, username, status, created_date, last_updated) " +
                "VALUES (?, ?, ?, CAST(? AS form_status), ?, ?)";

        String formid = (String) formData.get("formid");
        String username = (String) request.getAttribute("username");
        try {
            jdbcTemplate.update(sql,
                    formid,
                    formData.get("formtypeid"),
                    username,
                    formData.get("status"),
                    LocalDate.now(),
                    LocalDate.now());

            // add content
            List<Map<String, Object>> contents = (List<Map<String, Object>>) formData.get("contents");
            if (contents != null) {
                for (Map<String, Object> content : contents) {
                    ResponseEntity<String> res = addFormContent(request, formid, content);
                    if (!res.getStatusCode().is2xxSuccessful())
                        return res;
                }
            }
            // Add Attachments
            List<Map<String, Object>> attachments = (List<Map<String, Object>>) formData.get("attachments");
            if (attachments != null) {
                for (Map<String, Object> attachment : attachments) {
                    ResponseEntity<String> res = addAttachment(request, formid, attachment);
                    if (!res.getStatusCode().is2xxSuccessful())
                        return res;
                }
            }

            List<Map<String, Object>> signatures = (List<Map<String, Object>>) formData.get("signatures");
            if (signatures != null) {
                for (Map<String, Object> signature : signatures) {
                    ResponseEntity<String> res = addSigner(request, formid, signature);
                    if (!res.getStatusCode().is2xxSuccessful())
                        return res;
                }
            }

            return new ResponseEntity<>("{\"message\": \"Full form submission successful\"}", HttpStatus.CREATED);
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

    @GetMapping("/exists/{formid}")
    public ResponseEntity<Boolean> doesFormExist(@PathVariable String formid) {
        String sql = "SELECT COUNT(*) FROM forms WHERE formid = ?";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, formid);
            return new ResponseEntity<>(count != null && count > 0, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add form content
    @PostMapping("/{formId}/content")
    public ResponseEntity<String> addFormContent(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> contentData) {
        // Extract contentTemplateId from request
        Integer content_template_id = contentData.get("content_template_id") != null
                ? Integer.parseInt(contentData.get("content_template_id").toString())
                : null;
        if (content_template_id == null) {
            return new ResponseEntity<>("content_template_id is required", HttpStatus.BAD_REQUEST);
        }

        // Check if content_template_id exists, if yes then delete the existing content
        String checkSql = "SELECT COUNT(*) FROM FORM_CONTENT WHERE formID = ? AND content_template_id = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, formId, content_template_id);
        if (count > 0) {
            String deleteSql = "DELETE FROM FORM_CONTENT WHERE formID = ? AND content_template_id = ?";
            jdbcTemplate.update(deleteSql, formId, content_template_id);
        }

        // Fetch the template to determine the expected value type
        String sqlTemplate = "SELECT value_type FROM form_content_templates WHERE content_template_id = ?";
        String valueType;
        try {
            valueType = jdbcTemplate.queryForObject(sqlTemplate, String.class, content_template_id);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid content_template_id", HttpStatus.BAD_REQUEST);
        }

        // Extract and cast the value based on value_type
        Object rawValue = contentData.get("field_value");
        if (rawValue == null) {
            return new ResponseEntity<>("field_value is required", HttpStatus.BAD_REQUEST);
        }
        String field_value;
        try {
            switch (valueType) {
                case "NUMBER":
                    field_value = String.valueOf(Double.parseDouble(rawValue.toString()));
                    break;
                case "TEXT":
                    if (rawValue instanceof Number || rawValue instanceof Boolean || rawValue instanceof LocalDate) {
                        return new ResponseEntity<>("Invalid field_value for type TEXT: " + rawValue
                                + ". Use type NUMBER if you intend to add a number, BOOLEAN if you intend to add a boolean, or DATE if you intend to add a date.",
                                HttpStatus.BAD_REQUEST);
                    }
                    field_value = rawValue.toString();
                    break;
                case "BOOLEAN":
                    if (rawValue instanceof Boolean) {
                        field_value = rawValue.toString();
                    } else {
                        return new ResponseEntity<>("Invalid field_value for type BOOLEAN", HttpStatus.BAD_REQUEST);
                    }
                    break;
                case "DATE":
                    try {
                        field_value = LocalDate.parse(rawValue.toString()).toString();
                    } catch (Exception e) {
                        return new ResponseEntity<>(
                                "Invalid field_value for type DATE. Please use ISO format (e.g., '2025-03-22').",
                                HttpStatus.BAD_REQUEST);
                    }
                    break;
                default:
                    return new ResponseEntity<>("Unsupported value_type: " + valueType, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid field_value for type " + valueType + ": " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
        }

        // Insert into form_content
        String sql = "INSERT INTO FORM_CONTENT (formID, field_value, content_template_id) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(sql, formId, field_value, content_template_id);
            return new ResponseEntity<>("Form content added successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error adding form content: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add signer - person you want to sign the form
    @PostMapping("/{formId}/signature")
    public ResponseEntity<String> addSigner(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> signerData) {
        String sql = "INSERT INTO SIGNATURES (formID, username, signature_template_id) VALUES (?, ?, ?)";

        // Log the debug information
        System.out.println("Debug: Inserting into SIGNATURES with formID=" + formId +
                ", username=" + signerData.get("username") +
                ", signature_template_id=" + signerData.get("signature_template_id"));

        jdbcTemplate.update(sql,
                formId,
                signerData.get("username"),
                signerData.get("signature_template_id") != null
                        ? Integer.parseInt(signerData.get("signature_template_id").toString())
                        : null);

        return new ResponseEntity<>("Signer added successfully", HttpStatus.CREATED);
    }

    // Signform
    @PostMapping("/{formId}/sign")
    public ResponseEntity<String> signForm(HttpServletRequest request,
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
        Integer enteredTitleId = signatureData.get("title_id") != null
                ? Integer.parseInt(signatureData.get("title_id").toString())
                : null;

        if (!user.get("firstname").equals(enteredFirstName) || !user.get("lastname").equals(enteredLastName)
                || !user.get("title_id").equals(enteredTitleId)) {
            return new ResponseEntity<>(
                    "Signature validation failed: First name, last name, or title ID does not match",
                    HttpStatus.BAD_REQUEST);
        }

        // Validate titleID from signature template
        Integer signatureTemplateId = signatureData.get("signature_template_id") != null
                ? Integer.parseInt(signatureData.get("signature_template_id").toString())
                : null;
        if (signatureTemplateId == null) {
            return new ResponseEntity<>("signature_template_id is required", HttpStatus.BAD_REQUEST);
        }

        String templateSql = "SELECT title_id FROM signature_templates WHERE signature_template_id = ?";
        Integer templateTitleId;
        try {
            templateTitleId = jdbcTemplate.queryForObject(templateSql, Integer.class, signatureTemplateId);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid signature_template_id", HttpStatus.BAD_REQUEST);
        }

        if (!user.get("title_id").equals(templateTitleId) || !templateTitleId.equals(enteredTitleId)) {
            return new ResponseEntity<>(
                    "Signature validation failed: Title ID mismatch with the requirements",
                    HttpStatus.BAD_REQUEST);
        }

        // Insert the signature
        String sql = "INSERT INTO SIGNATURES (signature_template_id, formid, username, signature, decided_on, status, rejection_reason, title_id) "
                +
                "VALUES (?, ?, ?, ?, ?, CAST(? AS form_status), ?, ?)";

        jdbcTemplate.update(sql,
                signatureTemplateId,
                formId,
                username,
                signature,
                signatureData.get("decided_on") != null ? LocalDate.parse(signatureData.get("decided_on").toString())
                        : null,
                signatureData.get("status"),
                signatureData.get("rejection_reason"),
                enteredTitleId);

        return new ResponseEntity<>("Signature added successfully", HttpStatus.CREATED);
    }

    // Add attachment
    @PostMapping("/{formId}/attachments")
    public ResponseEntity<String> addAttachment(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> attachmentData) {
        // Expecting file_content as base64 string
        String sql = "INSERT INTO ATTACHMENTS (formID, attatchment_template_id, file_content) " +
                "VALUES (?,?, ?)";
        byte[] fileContentBytes = null;
        if (attachmentData.get("file_content") != null) {
            try {
                String base64 = attachmentData.get("file_content").toString();
                fileContentBytes = java.util.Base64.getDecoder().decode(base64);
            } catch (Exception e) {
                return new ResponseEntity<>("Invalid file_content: " + e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }

        jdbcTemplate.update(sql,
                formId,
                attachmentData.get("attatchment_template_id") != null
                        ? Integer.parseInt(attachmentData.get("attatchment_template_id").toString())
                        : null,
                fileContentBytes);

        return new ResponseEntity<>("Attachment added successfully", HttpStatus.CREATED);
    }

    @GetMapping("/attachments/test-pdf")
    public ResponseEntity<byte[]> getFirstPdfAttachment() {
        String sql = "SELECT file_content FROM ATTACHMENTS WHERE file_content IS NOT NULL LIMIT 1";

        try {
            byte[] pdfBytes = jdbcTemplate.queryForObject(sql, byte[].class);

            if (pdfBytes == null || pdfBytes.length == 0) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"test.pdf\"")
                    .header("Content-Type", "application/pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}