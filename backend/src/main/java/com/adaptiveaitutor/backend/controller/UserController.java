package com.adaptiveaitutor.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.dto.LoginResponse;
import com.adaptiveaitutor.backend.entity.StudentProfile;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.exception.EmailAlreadyExistsException;
import com.adaptiveaitutor.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService =
                userService;
    }

    // =====================================================
    // SIGN UP
    // =====================================================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody User user) {

        try {

            User savedUser =
                    userService.registerUser(
                            user
                    );

            LoginResponse response =
                    new LoginResponse(
                            savedUser.getId(),
                            savedUser.getName(),
                            savedUser.getEmail(),
                            savedUser.getRole()
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (
                EmailAlreadyExistsException exception
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User user) {

        try {

            User loggedInUser =
                    userService.loginUser(
                            user.getEmail(),
                            user.getPassword()
                    );

            // ---------------------------------------------
            // DEFAULT LOGIN VALUES
            // ---------------------------------------------

            String studentId = null;

            boolean mustChangePassword = false;

            // ---------------------------------------------
            // LOAD STUDENT PROFILE
            // ---------------------------------------------

            if ("student".equalsIgnoreCase(
                    loggedInUser.getRole()
            )) {

                StudentProfile profile =
                        userService.getStudentProfile(
                                loggedInUser.getId()
                        );

                if (profile != null) {

                    studentId =
                            profile.getStudentId();

                    mustChangePassword =
                            profile.isMustChangePassword();
                }
            }

            // ---------------------------------------------
            // BUILD LOGIN RESPONSE
            // ---------------------------------------------

            LoginResponse response =
                    new LoginResponse(
                            loggedInUser.getId(),
                            loggedInUser.getName(),
                            loggedInUser.getEmail(),
                            loggedInUser.getRole(),
                            studentId,
                            mustChangePassword
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException exception) {

            String message =
                    exception.getMessage();

            // -------------------------------------------------
            // EXPIRED TEMPORARY PASSWORD
            // -------------------------------------------------

            if (
                    message != null &&
                    message.equals(
                            "Temporary password has expired"
                    )
            ) {

                return ResponseEntity
                        .status(403)
                        .body(
                                message
                        );
            }

            // -------------------------------------------------
            // NORMAL LOGIN FAILURE
            // -------------------------------------------------

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid email or password"
                    );
        }
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long userId) {

        try {

            User user =
                    userService.getUserById(
                            userId
                    );

            String studentId = null;

            boolean mustChangePassword = false;

            // -------------------------------------------------
            // LOAD STUDENT PROFILE
            // -------------------------------------------------

            if ("student".equalsIgnoreCase(
                    user.getRole()
            )) {

                StudentProfile profile =
                        userService.getStudentProfile(
                                user.getId()
                        );

                if (profile != null) {

                    studentId =
                            profile.getStudentId();

                    mustChangePassword =
                            profile.isMustChangePassword();
                }
            }

            LoginResponse response =
                    new LoginResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole(),
                            studentId,
                            mustChangePassword
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request) {

        try {

            User updatedUser =
                    userService.updateProfile(
                            userId,
                            request.getName(),
                            request.getEmail()
                    );

            String studentId = null;

            boolean mustChangePassword = false;

            // -------------------------------------------------
            // LOAD STUDENT PROFILE
            // -------------------------------------------------

            if ("student".equalsIgnoreCase(
                    updatedUser.getRole()
            )) {

                StudentProfile profile =
                        userService.getStudentProfile(
                                updatedUser.getId()
                        );

                if (profile != null) {

                    studentId =
                            profile.getStudentId();

                    mustChangePassword =
                            profile.isMustChangePassword();
                }
            }

            LoginResponse response =
                    new LoginResponse(
                            updatedUser.getId(),
                            updatedUser.getName(),
                            updatedUser.getEmail(),
                            updatedUser.getRole(),
                            studentId,
                            mustChangePassword
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (
                EmailAlreadyExistsException exception
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );
        }
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody ChangePasswordRequest request) {

        try {

            userService.changePassword(
                    userId,
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Password updated successfully."
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // UPDATE PROFILE REQUEST
    // =====================================================

    public static class UpdateProfileRequest {

        private String name;

        private String email;

        public UpdateProfileRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(
                String name) {

            this.name =
                    name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(
                String email) {

            this.email =
                    email;
        }
    }

    // =====================================================
    // CHANGE PASSWORD REQUEST
    // =====================================================

    public static class ChangePasswordRequest {

        private String currentPassword;

        private String newPassword;

        public ChangePasswordRequest() {
        }

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(
                String currentPassword) {

            this.currentPassword =
                    currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(
                String newPassword) {

            this.newPassword =
                    newPassword;
        }
    }

    // =====================================================
    // MESSAGE RESPONSE
    // =====================================================

    public static class MessageResponse {

        private String message;

        public MessageResponse(
                String message) {

            this.message =
                    message;
        }

        public String getMessage() {
            return message;
        }
    }
}