package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.dto.BulkInvitationResult;
import com.adaptiveaitutor.backend.dto.BulkInvitationStudent;
import com.adaptiveaitutor.backend.dto.StudentOnboardingResult;
import com.adaptiveaitutor.backend.entity.ClassroomInvitation;

@Service
public class BulkInvitationEmailService {

    private final JavaMailSender mailSender;

    private final ClassroomInvitationService invitationService;

    private final StudentOnboardingService studentOnboardingService;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public BulkInvitationEmailService(
            JavaMailSender mailSender,
            ClassroomInvitationService invitationService,
            StudentOnboardingService studentOnboardingService
    ) {

        this.mailSender = mailSender;

        this.invitationService =
                invitationService;

        this.studentOnboardingService =
                studentOnboardingService;
    }

    // =====================================================
    // SEND BULK INVITATIONS
    // =====================================================

    public BulkInvitationResult sendBulkInvitations(
            Long classroomId,
            Long teacherId,
            List<BulkInvitationStudent> students,
            String frontendBaseUrl
    ) {

        BulkInvitationResult result =
                new BulkInvitationResult();

        // -------------------------------------------------
        // EMPTY LIST
        // -------------------------------------------------

        if (
                students == null ||
                students.isEmpty()
        ) {

            result.setTotal(0);
            result.setSent(0);
            result.setFailed(0);

            return result;
        }

        result.setTotal(
                students.size()
        );

        // -------------------------------------------------
        // PROCESS EVERY STUDENT
        // -------------------------------------------------

        for (
                BulkInvitationStudent student :
                students
        ) {

            String name =
                    student == null ||
                    student.getName() == null
                            ? ""
                            : student.getName()
                                    .trim();

            String email =
                    student == null ||
                    student.getEmail() == null
                            ? ""
                            : student.getEmail()
                                    .trim()
                                    .toLowerCase();

            // =================================================
            // VALIDATE NAME
            // =================================================

            if (name.isBlank()) {

                result.setFailed(
                        result.getFailed() + 1
                );

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "FAILED",
                                        "Student name is required."
                                )
                );

                continue;
            }

            // =================================================
            // VALIDATE EMAIL
            // =================================================

            if (email.isBlank()) {

                result.setFailed(
                        result.getFailed() + 1
                );

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "FAILED",
                                        "Student email is required."
                                )
                );

                continue;
            }

            if (!isValidEmail(email)) {

                result.setFailed(
                        result.getFailed() + 1
                );

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "FAILED",
                                        "Invalid email address."
                                )
                );

                continue;
            }

            // =================================================
            // CREATE ACCOUNT + INVITATION + EMAIL
            // =================================================

            try {

                // -------------------------------------------------
                // STEP 1: CREATE / REUSE STUDENT ACCOUNT
                // -------------------------------------------------

                StudentOnboardingResult onboardingResult =
                        studentOnboardingService
                                .onboardStudent(
                                        classroomId,
                                        teacherId,
                                        name,
                                        email
                                );

                // -------------------------------------------------
                // STEP 2: CREATE SECURE INVITATION
                // -------------------------------------------------

                ClassroomInvitation invitation =
                        invitationService.createInvitation(
                                classroomId,
                                teacherId
                        );

                // -------------------------------------------------
                // STEP 3: BUILD INVITATION LINK
                // -------------------------------------------------

                String invitationLink =
                        buildInvitationLink(
                                frontendBaseUrl,
                                invitation.getToken()
                        );

                // -------------------------------------------------
                // STEP 4: GET CLASSROOM INFORMATION
                // -------------------------------------------------

                String classroomName =
                        invitation
                                .getClassroom()
                                .getName();

                String joinCode =
                        invitation
                                .getClassroom()
                                .getJoinCode();

                // -------------------------------------------------
                // STEP 5: SEND EMAIL
                // -------------------------------------------------

                sendInvitationEmail(
                        onboardingResult,
                        classroomName,
                        joinCode,
                        invitationLink
                );

                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                result.setSent(
                        result.getSent() + 1
                );

                String successMessage;

                if (
                        onboardingResult.isNewAccount()
                ) {

                    successMessage =
                            "Student account created and invitation sent successfully.";
                } else {

                    successMessage =
                            "Existing student account linked and invitation sent successfully.";
                }

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "SENT",
                                        successMessage
                                )
                );

            } catch (
                    Exception exception
            ) {

                exception.printStackTrace();

                result.setFailed(
                        result.getFailed() + 1
                );

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "FAILED",
                                        exception.getMessage() != null
                                                ? exception.getMessage()
                                                : "Unable to send invitation."
                                )
                );
            }
        }

        return result;
    }

    // =====================================================
    // SEND ONE EMAIL
    // =====================================================

    private void sendInvitationEmail(
            StudentOnboardingResult onboardingResult,
            String classroomName,
            String joinCode,
            String invitationLink
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        // -------------------------------------------------
        // SENDER
        // -------------------------------------------------

        if (
                senderEmail != null &&
                !senderEmail.isBlank()
        ) {

            message.setFrom(
                    senderEmail
            );
        }

        // -------------------------------------------------
        // RECIPIENT
        // -------------------------------------------------

        message.setTo(
                onboardingResult.getEmail()
        );

        // -------------------------------------------------
        // SUBJECT
        // -------------------------------------------------

        message.setSubject(
                "Student Account & Classroom Invitation - "
                        + classroomName
                        + " - Adaptive AI Tutor"
        );

        // -------------------------------------------------
        // BODY
        // -------------------------------------------------

        message.setText(
                buildEmailBody(
                        onboardingResult,
                        classroomName,
                        joinCode,
                        invitationLink
                )
        );

        // -------------------------------------------------
        // SEND
        // -------------------------------------------------

        mailSender.send(
                message
        );
    }

    // =====================================================
    // BUILD EMAIL BODY
    // =====================================================

    private String buildEmailBody(
            StudentOnboardingResult onboardingResult,
            String classroomName,
            String joinCode,
            String invitationLink
    ) {

        String credentialSection;

        // =================================================
        // NEW STUDENT ACCOUNT
        // =================================================

        if (
                onboardingResult.isNewAccount()
        ) {

            credentialSection =
                    """
                    Your Student Account Details:

                    Student ID:
                    %s

                    Temporary Password:
                    %s

                    IMPORTANT:
                    This temporary password expires in 24 hours.
                    You must change your password after signing in.

                    """
                            .formatted(
                                    onboardingResult
                                            .getStudentId(),
                                    onboardingResult
                                            .getTemporaryPassword()
                            );

        } else {

            // =================================================
            // EXISTING STUDENT ACCOUNT
            // =================================================

            credentialSection =
                    """
                    Your Student Account:

                    Student ID:
                    %s

                    This email belongs to an existing student account.
                    Please sign in using your existing password.

                    """
                            .formatted(
                                    onboardingResult
                                            .getStudentId()
                            );
        }

        return """
                Hello %s,

                You have been added to the following classroom:

                %s

                on the Adaptive AI Tutor platform.

                %s
                Open your secure invitation link:

                %s

                Classroom Join Code:

                %s

                The invitation link is valid for 24 hours.

                Please do not share your login credentials or
                invitation link with other people.

                Thank you,
                Adaptive AI Tutor
                """
                .formatted(
                        onboardingResult.getName(),
                        classroomName,
                        credentialSection,
                        invitationLink,
                        joinCode
                );
    }

    // =====================================================
    // BUILD INVITATION LINK
    // =====================================================

    private String buildInvitationLink(
            String frontendBaseUrl,
            String token
    ) {

        String baseUrl;

        // -------------------------------------------------
        // DEFAULT LOCALHOST URL
        // -------------------------------------------------

        if (
                frontendBaseUrl == null ||
                frontendBaseUrl.isBlank()
        ) {

            baseUrl =
                    "http://localhost:5173";

        } else {

            baseUrl =
                    frontendBaseUrl
                            .trim()
                            .replaceAll(
                                    "/+$",
                                    ""
                            );
        }

        // -------------------------------------------------
        // TOKEN-ONLY URL
        // -------------------------------------------------
        //
        // IMPORTANT:
        // Password is NEVER placed in this URL.
        //

        return baseUrl
                + "/student/invite/"
                + token;
    }

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    private boolean isValidEmail(
            String email
    ) {

        return email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        );
    }
}