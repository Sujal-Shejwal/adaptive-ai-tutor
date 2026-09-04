package com.adaptiveaitutor.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.ClassroomInvitation;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.ClassroomInvitationRepository;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class ClassroomInvitationService {

    private final ClassroomInvitationRepository invitationRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    private final SecureRandom secureRandom =
            new SecureRandom();

    private static final int TOKEN_LENGTH = 48;

    private static final String TOKEN_CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789";

    public ClassroomInvitationService(
            ClassroomInvitationRepository invitationRepository,
            ClassroomRepository classroomRepository,
            ClassroomEnrollmentRepository enrollmentRepository,
            UserRepository userRepository) {

        this.invitationRepository =
                invitationRepository;

        this.classroomRepository =
                classroomRepository;

        this.enrollmentRepository =
                enrollmentRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // CREATE INVITATION
    // =====================================================

    public ClassroomInvitation createInvitation(
            Long classroomId,
            Long teacherId) {

        // -------------------------------------------------
        // FIND CLASSROOM
        // -------------------------------------------------

        Classroom classroom =
                classroomRepository
                        .findById(classroomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Classroom not found"
                                )
                        );

        // -------------------------------------------------
        // VERIFY TEACHER
        // -------------------------------------------------

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );

        if (!"teacher".equalsIgnoreCase(
                teacher.getRole()
        )) {

            throw new RuntimeException(
                    "Only teachers can create invitations"
            );
        }

        // -------------------------------------------------
        // VERIFY CLASSROOM OWNER
        // -------------------------------------------------

        if (
                classroom.getTeacher() == null ||
                classroom.getTeacher().getId() == null ||
                !classroom.getTeacher()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to create an invitation for this classroom"
            );
        }

        // -------------------------------------------------
        // CREATE TOKEN
        // -------------------------------------------------

        String token =
                generateUniqueToken();

        LocalDateTime createdAt =
                LocalDateTime.now();

        // Invitation valid for 24 hours.
        LocalDateTime expiresAt =
                createdAt.plusHours(24);

        ClassroomInvitation invitation =
                new ClassroomInvitation(
                        classroom,
                        token,
                        createdAt,
                        expiresAt
                );

        return invitationRepository.save(
                invitation
        );
    }

    // =====================================================
    // GET INVITATION
    // =====================================================

    public ClassroomInvitation getInvitation(
            String token) {

        if (
                token == null ||
                token.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Invitation token is required"
            );
        }

        ClassroomInvitation invitation =
                invitationRepository
                        .findByToken(
                                token.trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid invitation"
                                )
                        );

        // -------------------------------------------------
        // EXPIRED
        // -------------------------------------------------

        if (
                "PENDING".equalsIgnoreCase(
                        invitation.getStatus()
                ) &&
                LocalDateTime.now()
                        .isAfter(
                                invitation.getExpiresAt()
                        )
        ) {

            invitation.setStatus(
                    "EXPIRED"
            );

            invitationRepository.save(
                    invitation
            );

            throw new RuntimeException(
                    "Invitation has expired"
            );
        }

        // -------------------------------------------------
        // ACCEPTED
        // -------------------------------------------------

        if (
                "ACCEPTED".equalsIgnoreCase(
                        invitation.getStatus()
                )
        ) {

            throw new RuntimeException(
                    "Invitation has already been used"
            );
        }

        // -------------------------------------------------
        // REVOKED
        // -------------------------------------------------

        if (
                "REVOKED".equalsIgnoreCase(
                        invitation.getStatus()
                )
        ) {

            throw new RuntimeException(
                    "Invitation has been revoked"
            );
        }

        return invitation;
    }

    // =====================================================
    // ACCEPT INVITATION
    // =====================================================

    @Transactional
    public ClassroomEnrollment acceptInvitation(
            String token,
            String joinCode,
            Long studentId) {

        ClassroomInvitation invitation =
                getInvitation(token);

        // -------------------------------------------------
        // VERIFY STUDENT
        // -------------------------------------------------

        User student =
                userRepository
                        .findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );

        if (!"student".equalsIgnoreCase(
                student.getRole()
        )) {

            throw new RuntimeException(
                    "Only students can accept classroom invitations"
            );
        }

        // -------------------------------------------------
        // VERIFY JOIN CODE
        // -------------------------------------------------

        String suppliedCode =
                joinCode == null
                        ? ""
                        : joinCode
                                .trim()
                                .toUpperCase();

        String actualCode =
                invitation
                        .getClassroom()
                        .getJoinCode()
                        .trim()
                        .toUpperCase();

        if (
                !actualCode.equals(
                        suppliedCode
                )
        ) {

            throw new RuntimeException(
                    "Invalid classroom join code"
            );
        }

        // -------------------------------------------------
        // CHECK EXISTING ENROLLMENT
        // -------------------------------------------------

        if (enrollmentRepository
                .existsByClassroomIdAndStudentId(
                        invitation
                                .getClassroom()
                                .getId(),
                        studentId
                )) {

            throw new RuntimeException(
                    "Student is already enrolled in this classroom"
            );
        }

        // -------------------------------------------------
        // CREATE ENROLLMENT
        // -------------------------------------------------

        ClassroomEnrollment enrollment =
                new ClassroomEnrollment(
                        invitation.getClassroom(),
                        student
                );

        ClassroomEnrollment savedEnrollment =
                enrollmentRepository.save(
                        enrollment
                );

        // -------------------------------------------------
        // MARK INVITATION ACCEPTED
        // -------------------------------------------------

        invitation.setStatus(
                "ACCEPTED"
        );

        invitation.setAcceptedAt(
                LocalDateTime.now()
        );

        invitationRepository.save(
                invitation
        );

        return savedEnrollment;
    }

    // =====================================================
    // GET CLASSROOM INVITATIONS
    // =====================================================

    public List<ClassroomInvitation>
            getClassroomInvitations(
                    Long classroomId,
                    Long teacherId) {

        Classroom classroom =
                classroomRepository
                        .findById(classroomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Classroom not found"
                                )
                        );

        if (
                classroom.getTeacher() == null ||
                classroom.getTeacher().getId() == null ||
                !classroom.getTeacher()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to view these invitations"
            );
        }

        return invitationRepository
                .findByClassroomId(
                        classroomId
                );
    }

    // =====================================================
    // GENERATE UNIQUE TOKEN
    // =====================================================

    private String generateUniqueToken() {

        String token;

        do {

            token =
                    generateToken();

        } while (
                invitationRepository
                        .existsByToken(token)
        );

        return token;
    }

    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    private String generateToken() {

        StringBuilder token =
                new StringBuilder(
                        TOKEN_LENGTH
                );

        for (
                int i = 0;
                i < TOKEN_LENGTH;
                i++
        ) {

            int index =
                    secureRandom.nextInt(
                            TOKEN_CHARACTERS.length()
                    );

            token.append(
                    TOKEN_CHARACTERS.charAt(index)
            );
        }

        return token.toString();
    }
}