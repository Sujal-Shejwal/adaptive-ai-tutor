package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.dto.BulkInvitationResult;
import com.adaptiveaitutor.backend.dto.BulkInvitationStudent;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.ClassroomInvitation;
import com.adaptiveaitutor.backend.service.BulkInvitationEmailService;
import com.adaptiveaitutor.backend.service.ClassroomInvitationService;

@RestController
@RequestMapping("/api/classroom-invitations")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassroomInvitationController {

    private final ClassroomInvitationService invitationService;

    private final BulkInvitationEmailService
            bulkInvitationEmailService;

    public ClassroomInvitationController(
            ClassroomInvitationService invitationService,
            BulkInvitationEmailService bulkInvitationEmailService) {

        this.invitationService =
                invitationService;

        this.bulkInvitationEmailService =
                bulkInvitationEmailService;
    }

    // =====================================================
    // CREATE SINGLE INVITATION
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createInvitation(
            @RequestBody
            CreateInvitationRequest request) {

        try {

            if (
                    request == null ||
                    request.getClassroomId() == null ||
                    request.getTeacherId() == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Classroom ID and teacher ID are required."
                                )
                        );
            }

            ClassroomInvitation invitation =
                    invitationService.createInvitation(
                            request.getClassroomId(),
                            request.getTeacherId()
                    );

            return ResponseEntity.ok(
                    new InvitationResponse(
                            invitation
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // BULK EMAIL INVITATIONS
    // =====================================================

    @PostMapping("/bulk-email")
    public ResponseEntity<?> sendBulkEmailInvitations(
            @RequestBody
            BulkInvitationRequest request) {

        try {

            if (
                    request == null ||
                    request.getClassroomId() == null ||
                    request.getTeacherId() == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Classroom ID and teacher ID are required."
                                )
                        );
            }

            if (
                    request.getStudents() == null ||
                    request.getStudents().isEmpty()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "At least one student is required."
                                )
                        );
            }

            BulkInvitationResult result =
                    bulkInvitationEmailService
                            .sendBulkInvitations(
                                    request.getClassroomId(),
                                    request.getTeacherId(),
                                    request.getStudents(),
                                    request.getFrontendBaseUrl()
                            );

            return ResponseEntity.ok(
                    result
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // GET INVITATION
    // =====================================================

    @GetMapping("/{token}")
    public ResponseEntity<?> getInvitation(
            @PathVariable String token) {

        try {

            ClassroomInvitation invitation =
                    invitationService.getInvitation(
                            token
                    );

            return ResponseEntity.ok(
                    new InvitationResponse(
                            invitation
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // ACCEPT INVITATION
    // =====================================================

    @PostMapping("/{token}/accept")
    public ResponseEntity<?> acceptInvitation(
            @PathVariable String token,
            @RequestBody
            AcceptInvitationRequest request) {

        try {

            if (
                    request == null ||
                    request.getStudentId() == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Student ID is required."
                                )
                        );
            }

            ClassroomEnrollment enrollment =
                    invitationService.acceptInvitation(
                            token,
                            request.getJoinCode(),
                            request.getStudentId()
                    );

            return ResponseEntity.ok(
                    enrollment
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // GET CLASSROOM INVITATIONS
    // =====================================================

    @GetMapping(
            "/classroom/{classroomId}/teacher/{teacherId}"
    )
    public ResponseEntity<?> getClassroomInvitations(
            @PathVariable Long classroomId,
            @PathVariable Long teacherId) {

        try {

            List<ClassroomInvitation> invitations =
                    invitationService
                            .getClassroomInvitations(
                                    classroomId,
                                    teacherId
                            );

            return ResponseEntity.ok(
                    invitations
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // CREATE INVITATION REQUEST
    // =====================================================

    public static class CreateInvitationRequest {

        private Long classroomId;

        private Long teacherId;

        public CreateInvitationRequest() {
        }

        public Long getClassroomId() {
            return classroomId;
        }

        public void setClassroomId(
                Long classroomId) {

            this.classroomId =
                    classroomId;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId =
                    teacherId;
        }
    }

    // =====================================================
    // BULK INVITATION REQUEST
    // =====================================================

    public static class BulkInvitationRequest {

        private Long classroomId;

        private Long teacherId;

        private String frontendBaseUrl;

        private List<BulkInvitationStudent> students;

        public BulkInvitationRequest() {
        }

        public Long getClassroomId() {
            return classroomId;
        }

        public void setClassroomId(
                Long classroomId) {

            this.classroomId =
                    classroomId;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId =
                    teacherId;
        }

        public String getFrontendBaseUrl() {
            return frontendBaseUrl;
        }

        public void setFrontendBaseUrl(
                String frontendBaseUrl) {

            this.frontendBaseUrl =
                    frontendBaseUrl;
        }

        public List<BulkInvitationStudent> getStudents() {
            return students;
        }

        public void setStudents(
                List<BulkInvitationStudent> students) {

            this.students =
                    students;
        }
    }

    // =====================================================
    // ACCEPT INVITATION REQUEST
    // =====================================================

    public static class AcceptInvitationRequest {

        private String joinCode;

        private Long studentId;

        public AcceptInvitationRequest() {
        }

        public String getJoinCode() {
            return joinCode;
        }

        public void setJoinCode(
                String joinCode) {

            this.joinCode =
                    joinCode;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(
                Long studentId) {

            this.studentId =
                    studentId;
        }
    }

    // =====================================================
    // INVITATION RESPONSE
    // =====================================================

    public static class InvitationResponse {

        private Long id;

        private Long classroomId;

        private String classroomName;

        private String token;

        private String status;

        private String expiresAt;

        public InvitationResponse(
                ClassroomInvitation invitation) {

            this.id =
                    invitation.getId();

            this.classroomId =
                    invitation
                            .getClassroom()
                            .getId();

            this.classroomName =
                    invitation
                            .getClassroom()
                            .getName();

            this.token =
                    invitation.getToken();

            this.status =
                    invitation.getStatus();

            this.expiresAt =
                    invitation
                            .getExpiresAt()
                            .toString();
        }

        public Long getId() {
            return id;
        }

        public Long getClassroomId() {
            return classroomId;
        }

        public String getClassroomName() {
            return classroomName;
        }

        public String getToken() {
            return token;
        }

        public String getStatus() {
            return status;
        }

        public String getExpiresAt() {
            return expiresAt;
        }
    }
}