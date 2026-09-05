package com.adaptiveaitutor.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.dto.StudentOnboardingResult;
import com.adaptiveaitutor.backend.entity.StudentProfile;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.StudentProfileRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class StudentOnboardingService {

    // =====================================================
    // TEMPORARY PASSWORD SETTINGS
    // =====================================================

    private static final int TEMP_PASSWORD_LENGTH = 12;

    private static final String PASSWORD_CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ"
                    + "abcdefghijkmnopqrstuvwxyz"
                    + "23456789"
                    + "@#$%";

    // =====================================================
    // DEPENDENCIES
    // =====================================================

    private final UserRepository userRepository;

    private final StudentProfileRepository studentProfileRepository;

    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom =
            new SecureRandom();

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public StudentOnboardingService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
                userRepository;

        this.studentProfileRepository =
                studentProfileRepository;

        this.passwordEncoder =
                passwordEncoder;
    }

    // =====================================================
    // BASIC STUDENT ONBOARDING
    // =====================================================
    //
    // Creates a new student account or reuses an existing
    // student account.
    //
    // IMPORTANT:
    // This method creates the ACCOUNT only.
    // Classroom enrollment is handled by the invitation
    // acceptance flow.
    // =====================================================

    @Transactional
    public StudentOnboardingResult onboardStudent(
            String name,
            String email
    ) {

        // -------------------------------------------------
        // VALIDATE NAME
        // -------------------------------------------------

        if (
                name == null ||
                name.isBlank()
        ) {

            throw new RuntimeException(
                    "Student name is required."
            );
        }

        // -------------------------------------------------
        // VALIDATE EMAIL
        // -------------------------------------------------

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new RuntimeException(
                    "Student email is required."
            );
        }

        String cleanName =
                name.trim();

        String cleanEmail =
                email.trim()
                        .toLowerCase();

        // -------------------------------------------------
        // CHECK EXISTING USER
        // -------------------------------------------------

        User existingUser =
                userRepository
                        .findByEmail(
                                cleanEmail
                        )
                        .orElse(null);

        // =================================================
        // EXISTING USER
        // =================================================

        if (existingUser != null) {

            // -------------------------------------------------
            // NEVER CONVERT A TEACHER ACCOUNT
            // -------------------------------------------------

            if (
                    existingUser.getRole() == null ||
                    !"STUDENT".equalsIgnoreCase(
                            existingUser.getRole()
                    )
            ) {

                throw new RuntimeException(
                        "This email is already registered as a teacher account."
                );
            }

            // -------------------------------------------------
            // FIND STUDENT PROFILE
            // -------------------------------------------------

            StudentProfile profile =
                    studentProfileRepository
                            .findByUserId(
                                    existingUser.getId()
                            )
                            .orElse(null);

            // -------------------------------------------------
            // CREATE PROFILE IF IT DOES NOT EXIST
            // -------------------------------------------------

            if (profile == null) {

                profile =
                        new StudentProfile();

                profile.setUser(
                        existingUser
                );

                profile.setStudentId(
                        generateUniqueStudentId()
                );

                // Existing account already has its
                // own password.
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

            // -------------------------------------------------
            // EXISTING ACCOUNT
            //
            // No new temporary password is generated.
            // -------------------------------------------------

            return new StudentOnboardingResult(
                    existingUser.getId(),
                    existingUser.getName(),
                    existingUser.getEmail(),
                    profile.getStudentId(),
                    null,
                    false
            );
        }

        // =================================================
        // CREATE NEW STUDENT ACCOUNT
        // =================================================

        String temporaryPassword =
                generateTemporaryPassword();

        // -------------------------------------------------
        // CREATE USER
        // -------------------------------------------------

        User student =
                new User();

        student.setName(
                cleanName
        );

        student.setEmail(
                cleanEmail
        );

        // IMPORTANT:
        // Store ONLY the BCrypt hash.
        student.setPassword(
                passwordEncoder.encode(
                        temporaryPassword
                )
        );

        student.setRole(
                "STUDENT"
        );

        User savedStudent =
                userRepository.save(
                        student
                );

        // -------------------------------------------------
        // CREATE STUDENT PROFILE
        // -------------------------------------------------

        StudentProfile profile =
                new StudentProfile();

        profile.setUser(
                savedStudent
        );

        profile.setStudentId(
                generateUniqueStudentId()
        );

        profile.setMustChangePassword(
                true
        );

        // Temporary password is valid for 24 hours.
        profile.setTemporaryPasswordExpiresAt(
                LocalDateTime.now()
                        .plusHours(24)
        );

        studentProfileRepository.save(
                profile
        );

        // -------------------------------------------------
        // RETURN RESULT
        // -------------------------------------------------
        //
        // temporaryPassword is returned only in memory so
        // the email service can send it.
        //
        // It is NOT stored in the database.
        // -------------------------------------------------

        return new StudentOnboardingResult(
                savedStudent.getId(),
                savedStudent.getName(),
                savedStudent.getEmail(),
                profile.getStudentId(),
                temporaryPassword,
                true
        );
    }

    // =====================================================
    // EXISTING BULK-EMAIL COMPATIBILITY METHOD
    // =====================================================
    //
    // The existing BulkInvitationEmailService already calls:
    //
    // onboardStudent(
    //     classroomId,
    //     teacherId,
    //     studentName,
    //     studentEmail
    // )
    //
    // We keep that method signature so the existing service
    // compiles without changing its API contract.
    //
    // classroomId and teacherId are accepted here because
    // the caller needs a classroom-specific onboarding
    // operation, but enrollment itself is intentionally
    // performed by invitation acceptance.
    // =====================================================

    @Transactional
    public StudentOnboardingResult onboardStudent(
            Long classroomId,
            Long teacherId,
            String name,
            String email
    ) {

        if (classroomId == null) {

            throw new RuntimeException(
                    "Classroom ID is required."
            );
        }

        if (teacherId == null) {

            throw new RuntimeException(
                    "Teacher ID is required."
            );
        }

        // -------------------------------------------------
        // ACCOUNT CREATION / REUSE
        // -------------------------------------------------

        return onboardStudent(
                name,
                email
        );
    }

    // =====================================================
    // GENERATE UNIQUE STUDENT ID
    // =====================================================

    private String generateUniqueStudentId() {

        String studentId;

        do {

            studentId =
                    "STU-"
                            + UUID.randomUUID()
                                    .toString()
                                    .replace(
                                            "-",
                                            ""
                                    )
                                    .substring(
                                            0,
                                            10
                                    )
                                    .toUpperCase();

        } while (
                studentProfileRepository
                        .existsByStudentId(
                                studentId
                        )
        );

        return studentId;
    }

    // =====================================================
    // GENERATE SECURE TEMPORARY PASSWORD
    // =====================================================

    private String generateTemporaryPassword() {

        StringBuilder password =
                new StringBuilder(
                        TEMP_PASSWORD_LENGTH
                );

        for (
                int index = 0;
                index < TEMP_PASSWORD_LENGTH;
                index++
        ) {

            int position =
                    secureRandom.nextInt(
                            PASSWORD_CHARACTERS.length()
                    );

            password.append(
                    PASSWORD_CHARACTERS.charAt(
                            position
                    )
            );
        }

        return password.toString();
    }
}