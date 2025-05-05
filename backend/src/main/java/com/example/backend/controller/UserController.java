package com.example.backend.controller;

import com.example.backend.service.EmailService;
import com.example.backend.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", exposedHeaders = "Authorization")
public class UserController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

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
    public ResponseEntity<String> createUser(HttpServletRequest request, @RequestBody Map<String, String> userData) {
        // Get the username of the requester
        String requesterUsername = (String) request.getAttribute("username");

        // Check if the requester is an admin
        String checkAdminSql = "SELECT level FROM USERS WHERE username = ?";
        Integer requesterLevel = jdbcTemplate.queryForObject(checkAdminSql,
                Integer.class, requesterUsername);
        if (requesterLevel == null || requesterLevel != 4) {
            return new ResponseEntity<>("Unauthorized: Only admins can create users",
                    HttpStatus.UNAUTHORIZED);
        }

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
                userData.get("firstname").trim(),
                userData.get("lastname").trim(),
                userData.get("level") != null ? Integer.parseInt(userData.get("level")) : null,
                userData.get("email"));

        jdbcTemplate.update(credSql,
                userData.get("username"),
                hashedPassword);

        // Send email notification
        String emailSubject = "SMU Form Application: We have successfully registered your account";
        String emailBody = "Please use below credentials to log in to our application. We will request you change your password for security\n"
                +
                "Username: " + userData.get("username") + "\n" +
                "Password: " + userData.get("username") + "\n";
        ;
        emailService.sendMessage(userData.get("email"), emailSubject, emailBody);
        return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
    }

    // Get current user by token
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        String username = request.getAttribute("username").toString();
        String sql = "SELECT u.*, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id " +
                "WHERE u.username = ?";

        Map<String, Object> user = jdbcTemplate.queryForMap(sql, username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Update user
    @PutMapping("/{username}")
    public ResponseEntity<String> updateUser(HttpServletRequest request, @PathVariable String username,
            @RequestBody Map<String, String> userData) {

        // Get the username of the requester
        String requesterUsername = (String) request.getAttribute("username");

        // Check if the requester is an admin
        String checkAdminSql = "SELECT level FROM USERS WHERE username = ?";
        Integer requesterLevel = jdbcTemplate.queryForObject(checkAdminSql, Integer.class, requesterUsername);
        if (requesterLevel == null || requesterLevel != 4) {
            return new ResponseEntity<>("Unauthorized: Only admins can update users", HttpStatus.UNAUTHORIZED);
        }

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

    // Get user with credentials and title
    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String username) {
        String sql = "SELECT u.*, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id " +
                "WHERE u.username = ?";

        Map<String, Object> user = jdbcTemplate.queryForMap(sql, username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Get all users with a specific title_id
    @GetMapping("/by-title/{titleId}")
    public ResponseEntity<List<Map<String, Object>>> getUsersByTitleId(@PathVariable int titleId) {
        String sql = "SELECT u.*, ut.title " +
                "FROM USERS u " +
                "LEFT JOIN USER_TITLES ut ON u.title_id = ut.title_id " +
                "WHERE u.title_id = ?";

        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql, titleId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Check if a username exists
    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsernameExists(@PathVariable String username) {
        String sql = "SELECT COUNT(*) FROM USERS WHERE username = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, username);
        return new ResponseEntity<>(count > 0, HttpStatus.OK);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<String> updatePassword(
            @RequestBody Map<String, String> data) {

        String username = data.get("username");
        String currentPassword = data.get("currentPassword");
        String newPassword = data.get("password");

        // If currentPassword is not provided, return bad request
        if (currentPassword == null || currentPassword.isEmpty()) {
            return new ResponseEntity<>("Current password must be provided", HttpStatus.BAD_REQUEST);
        }

        // Fetch the current hashed password from the database
        String fetchPasswordSql = "SELECT password FROM CREDENTIALS WHERE username = ?";
        String storedHash;
        try {
            storedHash = jdbcTemplate.queryForObject(fetchPasswordSql, String.class, username);
        } catch (EmptyResultDataAccessException e) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Verify the current password
        if (!BCrypt.checkpw(currentPassword, storedHash)) {
            return new ResponseEntity<>("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        System.out.println(
                "Current password is correct - BCrypt check passed" + BCrypt.checkpw(currentPassword, storedHash)); // Debug
                                                                                                                    // log

        // Generate new salt and hash the new password
        String salt = BCrypt.gensalt();
        String hashedPassword = BCrypt.hashpw(newPassword, salt);

        // Update the password in the database
        String updatePasswordSql = "UPDATE CREDENTIALS SET password = ?, login_first_time = FALSE WHERE username = ?";
        jdbcTemplate.update(updatePasswordSql, hashedPassword, username);

        return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
    }

    // Delete user (cascades to credentials due to FK)
    @DeleteMapping("/{username}")
    public ResponseEntity<String> deleteUser(HttpServletRequest request, @PathVariable String username) {
        try {
            // Get the username of the requester
            String requesterUsername = (String) request.getAttribute("username");

            // Check if the requester is an admin
            String checkAdminSql = "SELECT level FROM USERS WHERE username = ?";
            Integer requesterLevel = jdbcTemplate.queryForObject(checkAdminSql, Integer.class, requesterUsername);
            if (requesterLevel == null || requesterLevel != 4) {
                return new ResponseEntity<>("Unauthorized: Only admins can delete users", HttpStatus.UNAUTHORIZED);
            }

            // Check if the user to be deleted exists
            String checkSql = "SELECT COUNT(*) FROM USERS WHERE username = ?";
            int userCount = jdbcTemplate.queryForObject(checkSql, Integer.class, username);
            if (userCount == 0) {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }

            // Check for foreign key usage in other tables
            String[] referenceChecks = {
                    "SELECT COUNT(*) FROM FORMS WHERE username = ?",
                    "SELECT COUNT(*) FROM SIGNATURES WHERE username = ?"
            };

            for (String query : referenceChecks) {
                int count = jdbcTemplate.queryForObject(query, Integer.class, username);
                if (count > 0) {
                    return new ResponseEntity<>(
                            "Cannot delete user: referenced in other data (e.g., forms or signatures)",
                            HttpStatus.CONFLICT);
                }
            }

            // Delete credentials first, then user
            String sql = "DELETE FROM CREDENTIALS WHERE username = ?";
            jdbcTemplate.update(sql, username);
            sql = "DELETE FROM USERS WHERE username = ?";
            jdbcTemplate.update(sql, username);

            return new ResponseEntity<>(HttpStatus.OK); // No body for 204
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all users
    @GetMapping("/admin/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        System.out.println("Username from request: " + username); // Debug log

        // Get level of user by username
        String sqlLevel = "SELECT level FROM USERS WHERE username = ?";
        Integer level;
        try {
            level = jdbcTemplate.queryForObject(sqlLevel, Integer.class, username);
        } catch (EmptyResultDataAccessException e) {
            System.out.println("No user found for username: " + username);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // 401 if user not found
        }

        // If user is not admin (level 4), return unauthorized
        if (level != 4) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // 401 for non-admins
        }

        // Fetch all users
        String sql = "SELECT u.*, ut.title " +
                "FROM USERS u " +
                // "LEFT JOIN CREDENTIALS c ON u.username = c.username " +
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

    @GetMapping("/titles/{titleId}")
    public ResponseEntity<Map<String, Object>> getTitleById(@PathVariable int titleId) {
        try {
            String sql = "SELECT title FROM USER_TITLES WHERE title_id = ?";
            Map<String, Object> title = jdbcTemplate.queryForMap(sql, titleId);
            return new ResponseEntity<>(title, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Title not found"), HttpStatus.NOT_FOUND);
        }
    }

    // delete user title
    @DeleteMapping("/titles/{titleId}")
    public ResponseEntity<String> deleteUserTitle(@PathVariable int titleId) {
        // Check references in USERS, SIGNATURE_TEMPLATES, SIGNATURES
        String dependencyCheck = """
                    SELECT EXISTS (
                        SELECT 1 FROM users WHERE title_id = ?
                        UNION
                        SELECT 1 FROM signature_templates WHERE title_id = ?
                        UNION
                        SELECT 1 FROM signatures WHERE title_id = ?
                    )
                """;

        Boolean isReferenced = jdbcTemplate.queryForObject(dependencyCheck, Boolean.class, titleId, titleId, titleId);

        if (Boolean.TRUE.equals(isReferenced)) {
            return new ResponseEntity<>("Cannot delete: title_id is referenced in other tables", HttpStatus.CONFLICT);
        }

        // Safe to delete
        String deleteSql = "DELETE FROM user_titles WHERE title_id = ?";
        int rowsAffected = jdbcTemplate.update(deleteSql, titleId);

        if (rowsAffected == 0) {
            return new ResponseEntity<>("No such title_id found", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>("Title deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail() {
        System.out.println("Sending test email...");
        emailService.sendMessage("vuhongson1412@gmail.com", "This is a test email", "This is a test email!");
        return new ResponseEntity<>("Email sent successfully", HttpStatus.OK);
    }

}