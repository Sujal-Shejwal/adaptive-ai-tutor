package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.StudentProfile;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.exception.EmailAlreadyExistsException;
import com.adaptiveaitutor.backend.repository.StudentProfileRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final StudentProfileRepository studentProfileRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository =
                userRepository;

        this.studentProfileRepository =
                studentProfileRepository;

        this.passwordEncoder =
                passwordEncoder;
    }

    // =====================================================
    // REGISTER USER
    // =====================================================

    public User registerUser(
            User user) {

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (userRepository.existsByEmail(
                user.getEmail())) {

            throw new EmailAlreadyExistsException(
                    "Email already registered"
            );
        }

        // -------------------------------------------------
        // HASH PASSWORD
        // -------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(
                user
        );
    }

    // =====================================================
    // LOGIN USER
    // =====================================================

    public User loginUser(
            String email,
            String password) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );

        // -------------------------------------------------
        // VERIFY PASSWORD
        // -------------------------------------------------

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid password"
            );
        }

        // -------------------------------------------------
        // CHECK TEMPORARY PASSWORD EXPIRY
        // -------------------------------------------------

        if ("student".equalsIgnoreCase(
                user.getRole()
        )) {

            StudentProfile profile =
                    studentProfileRepository
                            .findByUserId(
                                    user.getId()
                            )
                            .orElse(null);

            if (
                    profile != null &&
                    profile.isMustChangePassword() &&
                    profile.getTemporaryPasswordExpiresAt() != null &&
                    LocalDateTime.now().isAfter(
                            profile.getTemporaryPasswordExpiresAt()
                    )
            ) {

                throw new RuntimeException(
                        "Temporary password has expired"
                );
            }
        }

        return user;
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    public User getUserById(
            Long userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }

    // =====================================================
    // GET STUDENT LOGIN DETAILS
    // =====================================================

    public StudentProfile getStudentProfile(
            Long userId) {

        return studentProfileRepository
                .findByUserId(userId)
                .orElse(null);
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public User updateProfile(
            Long userId,
            String name,
            String email) {

        User user =
                getUserById(userId);

        // -------------------------------------------------
        // VALIDATE NAME
        // -------------------------------------------------

        if (
                name == null ||
                name.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Name cannot be empty"
            );
        }

        // -------------------------------------------------
        // VALIDATE EMAIL
        // -------------------------------------------------

        if (
                email == null ||
                email.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }

        String trimmedName =
                name.trim();

        String trimmedEmail =
                email.trim();

        // -------------------------------------------------
        // CHECK WHETHER EMAIL CHANGED
        // -------------------------------------------------

        if (
                !trimmedEmail.equalsIgnoreCase(
                        user.getEmail()
                )
        ) {

            boolean emailExists =
                    userRepository
                            .existsByEmail(
                                    trimmedEmail
                            );

            if (emailExists) {

                throw new EmailAlreadyExistsException(
                        "Email already registered"
                );
            }

            user.setEmail(
                    trimmedEmail
            );
        }

        // -------------------------------------------------
        // UPDATE NAME
        // -------------------------------------------------

        user.setName(
                trimmedName
        );

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return userRepository.save(
                user
        );
    }

    // =====================================================
    // UPDATE STUDENT PROFILE DETAILS
    // =====================================================

    public User updateProfile(
            Long userId,
            String name,
            String email,
            String phone,
            String department,
            String year) {

        User user =
                updateProfile(
                        userId,
                        name,
                        email
                );

        // Extra profile fields belong to StudentProfile.
        if ("student".equalsIgnoreCase(
                user.getRole()
        )) {

            StudentProfile profile =
                    studentProfileRepository
                            .findByUserId(userId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Student profile not found"
                                    )
                            );

            profile.setPhone(
                    normalizeOptional(phone)
            );

            profile.setDepartment(
                    normalizeOptional(department)
            );

            profile.setYear(
                    normalizeOptional(year)
            );

            studentProfileRepository.save(profile);
        }

        return user;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    @Transactional
    public void changePassword(
            Long userId,
            String currentPassword,
            String newPassword) {

        User user =
                getUserById(userId);

        // -------------------------------------------------
        // VALIDATE CURRENT PASSWORD
        // -------------------------------------------------

        if (
                currentPassword == null ||
                currentPassword.isBlank()
        ) {

            throw new RuntimeException(
                    "Current password is required"
            );
        }

        // -------------------------------------------------
        // VALIDATE NEW PASSWORD
        // -------------------------------------------------

        if (
                newPassword == null ||
                newPassword.isBlank()
        ) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        if (
                newPassword.length() < 6
        ) {

            throw new RuntimeException(
                    "New password must contain at least 6 characters"
            );
        }

        // -------------------------------------------------
        // VERIFY CURRENT PASSWORD
        // -------------------------------------------------

        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        // -------------------------------------------------
        // HASH NEW PASSWORD
        // -------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        // -------------------------------------------------
        // SAVE USER
        // -------------------------------------------------

        userRepository.save(
                user
        );

        // -------------------------------------------------
        // COMPLETE FIRST-LOGIN PASSWORD CHANGE
        // -------------------------------------------------

        if ("student".equalsIgnoreCase(
                user.getRole()
        )) {

            StudentProfile profile =
                    studentProfileRepository
                            .findByUserId(
                                    user.getId()
                            )
                            .orElse(null);

            if (profile != null) {

                profile.setMustChangePassword(
                        false
                );

                profile.setTemporaryPasswordExpiresAt(
                        null
                );

                studentProfileRepository.save(
                        profile
                );
            }
        }
    }
}