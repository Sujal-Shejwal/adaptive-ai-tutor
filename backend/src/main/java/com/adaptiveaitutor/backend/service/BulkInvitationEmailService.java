package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.dto.BulkInvitationResult;
import com.adaptiveaitutor.backend.dto.BulkInvitationStudent;
import com.adaptiveaitutor.backend.entity.ClassroomInvitation;

@Service
public class BulkInvitationEmailService {

    private final JavaMailSender mailSender;

    private final ClassroomInvitationService invitationService;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public BulkInvitationEmailService(
            JavaMailSender mailSender,
            ClassroomInvitationService invitationService) {

        this.mailSender = mailSender;
        this.invitationService = invitationService;
    }

    // =====================================================
    // SEND BULK INVITATIONS
    // =====================================================

    public BulkInvitationResult sendBulkInvitations(
            Long classroomId,
            Long teacherId,
            List<BulkInvitationStudent> students,
            String frontendBaseUrl) {

        BulkInvitationResult result =
                new BulkInvitationResult();

        // -------------------------------------------------
        // EMPTY LIST
        // -------------------------------------------------

        if (students == null || students.isEmpty()) {

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

        for (BulkInvitationStudent student : students) {

            String name =
                    student == null ||
                    student.getName() == null
                            ? ""
                            : student.getName().trim();

            String email =
                    student == null ||
                    student.getEmail() == null
                            ? ""
                            : student.getEmail()
                                    .trim()
                                    .toLowerCase();

            // -------------------------------------------------
            // VALIDATE NAME
            // -------------------------------------------------

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

            // -------------------------------------------------
            // VALIDATE EMAIL
            // -------------------------------------------------

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

            // -------------------------------------------------
            // SEND INVITATION
            // -------------------------------------------------

            try {

                ClassroomInvitation invitation =
                        invitationService.createInvitation(
                                classroomId,
                                teacherId
                        );

                String invitationLink =
                        buildInvitationLink(
                                frontendBaseUrl,
                                invitation.getToken()
                        );

                String classroomName =
                        invitation
                                .getClassroom()
                                .getName();

                String joinCode =
                        invitation
                                .getClassroom()
                                .getJoinCode();

                // -------------------------------------------------
                // SEND EMAIL
                // -------------------------------------------------

                sendInvitationEmail(
                        name,
                        email,
                        classroomName,
                        joinCode,
                        invitationLink
                );

                result.setSent(
                        result.getSent() + 1
                );

                result.getResults().add(
                        new BulkInvitationResult
                                .StudentInvitationResult(
                                        name,
                                        email,
                                        "SENT",
                                        "Invitation sent successfully."
                                )
                );

            } catch (Exception exception) {

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
            String studentName,
            String studentEmail,
            String classroomName,
            String joinCode,
            String invitationLink) {

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
                studentEmail
        );

        // -------------------------------------------------
        // SUBJECT
        // -------------------------------------------------

        message.setSubject(
                "Invitation to join "
                        + classroomName
                        + " - Adaptive AI Tutor"
        );

        // -------------------------------------------------
        // BODY
        // -------------------------------------------------

        message.setText(
                buildEmailBody(
                        studentName,
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
    // EMAIL BODY
    // =====================================================

    private String buildEmailBody(
            String studentName,
            String classroomName,
            String joinCode,
            String invitationLink) {

        return """
                Hello %s,

                You have been invited to join:

                %s

                on the Adaptive AI Tutor platform.

                Open your invitation link:

                %s

                After opening the link, log in or create your student account.

                Classroom Join Code:

                %s

                The invitation link is valid for 24 hours.

                Please do not share this invitation with other people.

                Thank you,
                Adaptive AI Tutor
                """.formatted(
                studentName,
                classroomName,
                invitationLink,
                joinCode
        );
    }

    // =====================================================
    // BUILD INVITATION LINK
    // =====================================================

    private String buildInvitationLink(
            String frontendBaseUrl,
            String token) {

        String baseUrl;

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

        return baseUrl
                + "/student/invite/"
                + token;
    }

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    private boolean isValidEmail(
            String email) {

        return email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        );
    }
}