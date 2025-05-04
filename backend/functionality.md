# Backend Functionalities

## User Management

### Create User
- **Parameters and return types:**
  - Input: Map<String, String> userData (username, titleId, firstname, lastname, email, level, password)
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/users
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Internal: checkRequiredFields()
  - Database: INSERT INTO USERS, INSERT INTO CREDENTIALS

### Get Current User
- **Parameters and return types:**
  - Input: HttpServletRequest request
  - Return: ResponseEntity<Map<String, Object>>
- **Who will call this functionality:**
  - API: GET /api/users
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from USERS, CREDENTIALS, USER_TITLES

### Update User
- **Parameters and return types:**
  - Input: HttpServletRequest request, String username, Map<String, String> userData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: PUT /api/users/{username}
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: UPDATE USERS

### Get User
- **Parameters and return types:**
  - Input: String username
  - Return: ResponseEntity<Map<String, Object>>
- **Who will call this functionality:**
  - API: GET /api/users/{username}
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from USERS, CREDENTIALS, USER_TITLES

### Update Password
- **Parameters and return types:**
  - Input: HttpServletRequest request, Map<String, String> data
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: PUT /api/users/reset-password
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: UPDATE CREDENTIALS

### Delete User
- **Parameters and return types:**
  - Input: HttpServletRequest request, String username
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: DELETE /api/users/{username}
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: DELETE from CREDENTIALS, DELETE from USERS

### Get All Users
- **Parameters and return types:**
  - Input: HttpServletRequest request
  - Return: ResponseEntity<List<Map<String, Object>>>
- **Who will call this functionality:**
  - API: GET /api/users/admin/all
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: SELECT from USERS, CREDENTIALS, USER_TITLES

### Login
- **Parameters and return types:**
  - Input: Map<String, String> credentials
  - Return: ResponseEntity<Map<String, Object>>
- **Who will call this functionality:**
  - API: POST /api/users/login
  - Called by unauthenticated users
- **What functionalities will be called by this functionality:**
  - Internal: JwtUtil.generateToken()
  - Database: SELECT from CREDENTIALS

### Create User Title
- **Parameters and return types:**
  - Input: Map<String, String> titleData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/users/titles
  - Called by admin users
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO USER_TITLES

## Form Management

### Create Form
- **Parameters and return types:**
  - Input: String token, Map<String, Object> formData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/forms
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Internal: JwtUtil.extractUsername()
  - Database: INSERT INTO FORMS

### Get All Forms for Admins
- **Parameters and return types:**
  - Input: HttpServletRequest request
  - Return: ResponseEntity<List<Map<String, Object>>>
- **Who will call this functionality:**
  - API: GET /api/forms/admin/all
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: SELECT from FORMS, FORM_TEMPLATES

### Get Form
- **Parameters and return types:**
  - Input: String token, String formId
  - Return: ResponseEntity<Map<String, Object>>
- **Who will call this functionality:**
  - API: GET /api/forms/{formId}
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Internal: JwtUtil.extractUsername()
  - Database: SELECT from FORMS, FORM_TEMPLATES, FORM_CONTENT, SIGNATURES, ATTACHMENTS

### Update Form
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formId, Map<String, String> formData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: PUT /api/forms/{formId}
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: UPDATE FORMS

### Delete Form
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formId
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: DELETE /api/forms/{formId}
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: DELETE from FORM_CONTENT, SIGNATURES, ATTACHMENTS, FORMS

### Get All Forms
- **Parameters and return types:**
  - Input: HttpServletRequest request
  - Return: ResponseEntity<List<Map<String, Object>>>
- **Who will call this functionality:**
  - API: GET /api/forms
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from FORMS, FORM_TEMPLATES

### Add Form Content
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formId, Map<String, Object> contentData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/forms/{formId}/content
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from FORM_CONTENT_TEMPLATES, INSERT INTO FORM_CONTENT

### Add Signature
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formId, Map<String, Object> signatureData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/forms/{formId}/signatures
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from USERS, INSERT INTO SIGNATURES

### Add Attachment
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formId, Map<String, Object> attachmentData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/forms/{formId}/attachments
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO ATTACHMENTS

## Form Template Management

### Create Form Template
- **Parameters and return types:**
  - Input: HttpServletRequest request, Map<String, String> templateData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/form-templates
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO FORM_TEMPLATES

### Get Form Template
- **Parameters and return types:**
  - Input: String formTypeId
  - Return: ResponseEntity<Map<String, Object>>
- **Who will call this functionality:**
  - API: GET /api/form-templates/{formTypeId}
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from FORM_TEMPLATES, FORM_CONTENT_TEMPLATES, SIGNATURE_TEMPLATES, ATTACHMENT_TEMPLATES

### Update Form Template
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formTypeId, Map<String, String> templateData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: PUT /api/form-templates/{formTypeId}
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: UPDATE FORM_TEMPLATES

### Delete Form Template
- **Parameters and return types:**
  - Input: HttpServletRequest request, String formTypeId
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: DELETE /api/form-templates/{formTypeId}
  - Called by admin users only
- **What functionalities will be called by this functionality:**
  - Database: DELETE from SIGNATURE_TEMPLATES, FORM_CONTENT_TEMPLATES, ATTACHMENT_TEMPLATES, FORMS, FORM_CONTENT, SIGNATURES, ATTACHMENTS, FORM_TEMPLATES

### Get All Form Templates
- **Parameters and return types:**
  - Input: HttpServletRequest request
  - Return: ResponseEntity<List<Map<String, Object>>>
- **Who will call this functionality:**
  - API: GET /api/form-templates
  - Called by authenticated users
- **What functionalities will be called by this functionality:**
  - Database: SELECT from FORM_TEMPLATES

### Add Content Template
- **Parameters and return types:**
  - Input: String formTypeId, Map<String, Object> contentData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/form-templates/{formTypeId}/content-templates
  - Called by admin users
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO FORM_CONTENT_TEMPLATES

### Add Signature Template
- **Parameters and return types:**
  - Input: String formTypeId, Map<String, Object> signatureData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/form-templates/{formTypeId}/signature-templates
  - Called by admin users
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO SIGNATURE_TEMPLATES

### Add Attachment Template
- **Parameters and return types:**
  - Input: String formTypeId, Map<String, String> attachmentData
  - Return: ResponseEntity<String>
- **Who will call this functionality:**
  - API: POST /api/form-templates/{formTypeId}/attachment-templates
  - Called by admin users
- **What functionalities will be called by this functionality:**
  - Database: INSERT INTO ATTACHMENT_TEMPLATES 