package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import com.example.backend.util.JwtUtil;
import com.example.backend.service.EmailService;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "http://localhost:3000", exposedHeaders = "Content-Disposition")
public class FormController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    // Create a new form
    @PostMapping
    public ResponseEntity<String> createForm(HttpServletRequest request,
            @RequestBody Map<String, Object> formData) {
        String sql = "INSERT INTO FORMS (formid, formtypeid, username, status, created_date, last_updated) " +
                "VALUES (?, ?, ?, CAST(? AS form_status), ?, ?)";

        String formid = (String) formData.get("formid");

        String username = (String) request.getAttribute("username");
        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
        int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
        if (level == 4) {
            username = (String) formData.get("username");
        }

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
    public ResponseEntity<Map<String, Object>> getForm(
            @PathVariable String formId) {
        // String username = JwtUtil.extractUsername(token.replace("Bearer ", ""));
        String sql = "SELECT f.*, ft.title, ft.description " +
                "FROM FORMS f " +
                "JOIN FORM_TEMPLATES ft ON f.formTypeID = ft.formTypeID " +
                "WHERE f.formID = ?";

        Map<String, Object> form = jdbcTemplate.queryForMap(sql, formId);

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

        // Get next signer
        Integer nextSigner = getNextSignerLevel(formId);
        if (nextSigner != null) {
            form.put("next_signer_level", nextSigner);
        } else {
            form.put("next_signer_level", "-1");
        }

        return new ResponseEntity<>(form, HttpStatus.OK);
    }

    private Integer getNextSignerLevel(String formId) {
        String sql = """
                    SELECT u.level
                    FROM users u
                    INNER JOIN signature_templates st ON u.title_id = st.title_id
                    INNER JOIN forms f ON f.formid = ?
                    INNER JOIN signatures s ON s.username = u.username AND s.formid = f.formid
                    WHERE st.formtypeid = f.formtypeid
                      AND s.status = 'PENDING'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM users u2
                          INNER JOIN signature_templates st2 ON u2.title_id = st2.title_id
                          INNER JOIN signatures s2 ON s2.username = u2.username AND s2.formid = f.formid
                          WHERE st2.formtypeid = f.formtypeid
                            AND u2.level < u.level
                            AND s2.status != 'APPROVED'
                      )
                    ORDER BY u.level
                    LIMIT 1
                """;

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, formId);
        if (result.isEmpty()) {
            return null;
        }
        // Check if the form status is rejected
        String formStatusSql = "SELECT status FROM forms WHERE formid = ?";
        String formStatus = jdbcTemplate.queryForObject(formStatusSql, String.class, formId);
        if ("REJECTED".equals(formStatus)) {
            return -1;
        }
        return (Integer) result.get(0).get("level");
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

        try {
            String username = (String) request.getAttribute("username");

            // Get user level
            String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
            int level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);

            // If not admin, check ownership
            if (level != 4) {
                String checkSql = "SELECT COUNT(*) FROM FORMS WHERE formID = ? AND username = ?";
                Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, formId, username);
                if (count == null || count == 0) {
                    return new ResponseEntity<>("Form not found or access denied", HttpStatus.NOT_FOUND);
                }
            }

            // Delete related records
            jdbcTemplate.update("DELETE FROM FORM_CONTENT WHERE formID = ?", formId);
            jdbcTemplate.update("DELETE FROM SIGNATURES WHERE formID = ?", formId);
            jdbcTemplate.update("DELETE FROM ATTACHMENTS WHERE formID = ?", formId);

            // Delete form
            String deleteFormSql = (level == 4)
                    ? "DELETE FROM FORMS WHERE formID = ?"
                    : "DELETE FROM FORMS WHERE formID = ? AND username = ?";
            if (level == 4) {
                jdbcTemplate.update(deleteFormSql, formId);
            } else {
                jdbcTemplate.update(deleteFormSql, formId, username);
            }

            return new ResponseEntity<>("Form deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting form: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

    // Get forms associated with signatures for a given username, including
    // signature status
    @GetMapping("/review-forms")
    public ResponseEntity<List<Map<String, Object>>> getFormsBySignatureUsername(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");

        String sql = "SELECT f.*, s.status AS signature_status, ft.title AS title " +
                "FROM forms f " +
                "JOIN signatures s ON f.formid = s.formid " +
                "JOIN form_templates ft ON f.formtypeid = ft.formtypeid " +
                "WHERE s.username = ?";

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

    // Get all signatures for a form
    @GetMapping("/{formId}/signatures")
    public ResponseEntity<List<Map<String, Object>>> getSignaturesByFormId(@PathVariable String formId) {
        String sql = "SELECT * FROM SIGNATURES WHERE formID = ?";

        List<Map<String, Object>> signatures = jdbcTemplate.queryForList(sql, formId);

        return new ResponseEntity<>(signatures, HttpStatus.OK);
    }

    // Signform
    @PutMapping("/{formId}/sign")
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
        String enteredFirstName = nameParts[0].trim();
        String enteredLastName = nameParts[1].trim();
        Integer enteredTitleId = signatureData.get("title_id") != null
                ? Integer.parseInt(signatureData.get("title_id").toString())
                : null;

        if (!user.get("firstname").toString().trim().equals(enteredFirstName) ||
                !user.get("lastname").toString().trim().equals(enteredLastName) ||
                !user.get("title_id").equals(enteredTitleId)) {
            System.out
                    .println("Debug: Validation failed. Expected firstname=" + user.get("firstname").toString().trim() +
                            ", lastname=" + user.get("lastname").toString().trim() +
                            ", title_id=" + user.get("title_id") +
                            ". Received firstname=" + enteredFirstName +
                            ", lastname=" + enteredLastName +
                            ", title_id=" + enteredTitleId);
            return new ResponseEntity<>(
                    "Signature validation failed: First name, last name, or title ID does not match ",
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

        String sql = "UPDATE signatures SET " +
                "status = CAST(? AS form_status), " +
                "rejection_reason = ?, " +
                "signature = ?, " +
                "decided_on = ?, " +
                "title_id = ? " +
                "WHERE signatureid = ?";

        Integer signatureId = signatureData.get("signatureid") != null
                ? Integer.parseInt(signatureData.get("signatureid").toString())
                : null;

        if (signatureId == null) {
            return new ResponseEntity<>("signatureid is required for update", HttpStatus.BAD_REQUEST);
        }

        jdbcTemplate.update(sql,
                signatureData.get("status"),
                signatureData.get("rejection_reason"),
                signatureData.get("signature"),
                signatureData.get("decided_on") != null
                        ? LocalDate.parse(signatureData.get("decided_on").toString())
                        : null,
                signatureData.get("title_id") != null
                        ? Integer.parseInt(signatureData.get("title_id").toString())
                        : null,
                signatureId);

        // If the signature is rejected, update the form status to rejected
        if ("REJECTED".equals(signatureData.get("status"))) {
            String updateFormStatusSql = "UPDATE FORMS SET status = CAST('REJECTED' AS form_status) WHERE formID = ?";
            jdbcTemplate.update(updateFormStatusSql, formId);
        }

        if ("APPROVED".equals(signatureData.get("status"))) {
            String countSql = "SELECT COUNT(*) FROM signatures WHERE formID = ? AND status != CAST('APPROVED' AS form_status)";
            Integer pendingOrRejectedCount = jdbcTemplate.queryForObject(countSql, Integer.class, formId);

            if (pendingOrRejectedCount != null && pendingOrRejectedCount == 0) {
                String updateFormStatusSql = "UPDATE FORMS SET status = CAST('APPROVED' AS form_status) WHERE formID = ?";
                jdbcTemplate.update(updateFormStatusSql, formId);
            }
        }

        return new ResponseEntity<>("Signature updated successfully", HttpStatus.OK);

    }

    // Add attachment
    @PostMapping("/{formId}/attachments")
    public ResponseEntity<String> addAttachment(HttpServletRequest request,
            @PathVariable String formId,
            @RequestBody Map<String, Object> attachmentData) {
        // Expecting file_content as base64 string
        String sql = "INSERT INTO ATTACHMENTS (formID, attachment_template_id, file_content, mime_type) " +
                "VALUES (?, ?, ?, ?)";
        byte[] fileContentBytes = null;
        if (attachmentData.get("file_content") != null) {
            try {
                String base64 = attachmentData.get("file_content").toString();
                fileContentBytes = java.util.Base64.getDecoder().decode(base64);
            } catch (Exception e) {
                return new ResponseEntity<>("Invalid file_content: " + e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }

        String mimeType = (String) attachmentData.get("mime_type");

        // Debug print all parameters
        System.out.println("Debug: Inserting into ATTACHMENTS with formID=" + formId +
                ", attachment_template_id=" + attachmentData.get("attachment_template_id") +
                ", mime_type=" + mimeType);

        jdbcTemplate.update(sql,
                formId,
                attachmentData.get("attachment_template_id") != null
                        ? Integer.parseInt(attachmentData.get("attachment_template_id").toString())
                        : null,
                fileContentBytes,
                mimeType);

        return new ResponseEntity<>("Attachment added successfully", HttpStatus.CREATED);
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Integer attachmentId) {
        String sql = "SELECT file_content, mime_type FROM attachments WHERE attachmentid = ?";

        try {
            System.out.println("Debug: Fetching attachment with ID: " + attachmentId);
            Map<String, Object> attachment = jdbcTemplate.queryForMap(sql, attachmentId);

            byte[] fileContent = (byte[]) attachment.get("file_content");
            String mimeType = (String) attachment.get("mime_type");

            if (fileContent == null || fileContent.length == 0) {
                System.out.println("Debug: No attachment found for ID: " + attachmentId);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            String fileExtension = mimeType != null ? mimeType.split("/")[1] : "dat";
            String filename = "attachment." + fileExtension;

            System.out.println("Debug: Attachment found for ID: " + attachmentId + ", MIME type: " + mimeType);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", mimeType)
                    .header("Access-Control-Expose-Headers", "Content-Disposition")
                    .body(fileContent);

        } catch (Exception e) {
            System.err.println("Error fetching attachment with ID: " + attachmentId + ". Error: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail() {
        System.out.println("Sending test email...");
        emailService.sendMessage("vuhongson1412@gmail.com", "This is a test email", "This is a test email!");
        return new ResponseEntity<>("Email sent successfully", HttpStatus.OK);
    }
}