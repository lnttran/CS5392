package com.example.backend.controller;

import com.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
// DEFAULT FRONTEND URL
@CrossOrigin(origins = "${frontend.url}")
public class UserController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ResponseEntity<String> checkRequiredFields(Map<String, String> data, String[] requiredFields) {
        for (String field : requiredFields) {
            if (data.get(field) == null) {
                return new ResponseEntity<>(field + " must be provided", HttpStatus.BAD_REQUEST);
            }
        }
        return null;
    }

    // Create user with credentials
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody Map<String, String> userData) {
        String userSql = "INSERT INTO USERS (username, title_id, firstname, lastname, level, email) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        String credSql = "INSERT INTO CREDENTIALS (username, password) VALUES (?, ?)";

        // Generate salt and hash password
        String plainPassword = userData.get("password");
        String salt = BCrypt.gensalt(); // Generate random salt
        String hashedPassword = BCrypt.hashpw(plainPassword, salt);

        String[] requiredFields = { "username", "titleId", "firstname", "lastname", "email", "level", "titleId" };
        ResponseEntity<String> missingFieldResponse = checkRequiredFields(userData, requiredFields);
        if (missingFieldResponse != null) {
            return missingFieldResponse;
        }

        jdbcTemplate.update(userSql,
                userData.get("username"),
                Integer.parseInt(userData.get("titleId")),
                userData.get("firstname"),
                userData.get("lastname"),
                userData.get("level") != null ? Integer.parseInt(userData.get("level")) : null,
                userData.get("email"));

        jdbcTemplate.update(credSql,
                userData.get("username"),
                hashedPassword);

        return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
    }

    // Get user with credentials and title
    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String username) {
        String sql = "SELECT u.*, c.password, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN CREDENTIALS c ON u.username = c.username " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id " +
                "WHERE u.username = ?";

        Map<String, Object> user = jdbcTemplate.queryForMap(sql, username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Update user
    @PutMapping("/{username}")
    public ResponseEntity<String> updateUser(@PathVariable String username, @RequestBody Map<String, String> userData) {
        String sql = "UPDATE USERS SET " +
                "title_id = ?, " +
                "firstname = ?, " +
                "lastname = ?, " +
                "level = ?, " +
                "email = ? " +
                "WHERE username = ?";

        jdbcTemplate.update(sql,
                userData.get("titleId") != null ? Integer.parseInt(userData.get("titleId")) : null,
                userData.get("firstname"),
                userData.get("lastname"),
                userData.get("level") != null ? Integer.parseInt(userData.get("level")) : null,
                userData.get("email"),
                username);

        return new ResponseEntity<>("User updated successfully", HttpStatus.OK);
    }

    // Update password
    @PutMapping("/{username}/reset-password")
    public ResponseEntity<String> updatePassword(@PathVariable String username, @RequestBody Map<String, String> data) {
        String sql = "UPDATE CREDENTIALS SET password = ?, login_first_time = FALSE  WHERE username = ?";

        // Generate new salt and hash new password
        String plainPassword = data.get("password");
        String salt = BCrypt.gensalt();
        String hashedPassword = BCrypt.hashpw(plainPassword, salt);

        jdbcTemplate.update(sql, hashedPassword, username);
        return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
    }

    // Delete user (cascades to credentials due to FK)
    @DeleteMapping("/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        // Delete credentials first due to foreign key constraint
        String sql = "DELETE FROM CREDENTIALS WHERE username = ?";
        jdbcTemplate.update(sql, username);
        sql = "DELETE FROM USERS WHERE username = ?";
        jdbcTemplate.update(sql, username);

        return new ResponseEntity<>("User deleted successfully", HttpStatus.NO_CONTENT);
    }

    // Get current user by token
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String token) {
        String username = JwtUtil.extractUsername(token.replace("Bearer ", ""));
        String sql = "SELECT u.*, c.password, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN CREDENTIALS c ON u.username = c.username " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id " +
                "WHERE u.username = ?";

        Map<String, Object> user = jdbcTemplate.queryForMap(sql, username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Get all users
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        String sql = "SELECT u.*, c.password, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN CREDENTIALS c ON u.username = c.username " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id";

        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Basic login check
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String sql = "SELECT password, login_first_time FROM CREDENTIALS WHERE username = ?";

        try {
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, credentials.get("username"));
            String storedHash = (String) result.get("password");
            Boolean loginFirstTime = (Boolean) result.get("login_first_time");

            if (storedHash != null && BCrypt.checkpw(credentials.get("password"), storedHash)) {
                String token = JwtUtil.generateToken(credentials.get("username"));
                Map<String, Object> response = Map.of(
                        "token", token,
                        "loginFirstTime", loginFirstTime);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Invalid credentials"), HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Invalid credentials"), HttpStatus.UNAUTHORIZED);
        }
    }

    // Create a new user title
    @PostMapping("/titles")
    public ResponseEntity<String> createUserTitle(@RequestBody Map<String, String> titleData) {
        String sql = "INSERT INTO USER_TITLES (title) VALUES (?)";
        jdbcTemplate.update(sql, titleData.get("title"));
        return new ResponseEntity<>("User title created successfully", HttpStatus.CREATED);
    }

    // Get all user titles
    @GetMapping("/titles")
    public ResponseEntity<List<Map<String, Object>>> getAllUserTitles() {
        String sql = "SELECT * FROM USER_TITLES";
        List<Map<String, Object>> titles = jdbcTemplate.queryForList(sql);
        return new ResponseEntity<>(titles, HttpStatus.OK);
    }

    // Add attachment template
    @PostMapping("/{formTypeId}/attachment-templates")
    public ResponseEntity<String> addAttachmentTemplate(@PathVariable String formTypeId,
            @RequestBody Map<String, String> attachmentData) {
        String sql = "INSERT INTO ATTACHMENT_TEMPLATES (formTypeID, file_type) " +
                "VALUES (?, CAST(? AS file_type))";

        jdbcTemplate.update(sql,
                formTypeId,
                attachmentData.get("fileType"));

        return new ResponseEntity<>("Attachment template added successfully", HttpStatus.CREATED);
    }
}