package com.adaptiveaitutor.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.service.ClassroomEnrollmentService;
import com.adaptiveaitutor.backend.service.ClassroomService;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final ClassroomEnrollmentService
            classroomEnrollmentService;

    public ClassroomController(
            ClassroomService classroomService,
            ClassroomEnrollmentService
                    classroomEnrollmentService) {

        this.classroomService =
                classroomService;

        this.classroomEnrollmentService =
                classroomEnrollmentService;
    }

    // =====================================================
    // CREATE CLASSROOM
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createClassroom(
            @RequestBody CreateClassroomRequest request) {

        try {

            Classroom classroom =
                    classroomService.createClassroom(
                            request.getName(),
                            request.getTeacherId()
                    );

            return ResponseEntity.ok(
                    classroom
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
    // GET TEACHER CLASSROOMS
    // =====================================================

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getTeacherClassrooms(
            @PathVariable Long teacherId) {

        try {

            List<Classroom> classrooms =
                    classroomService
                            .getTeacherClassrooms(
                                    teacherId
                            );

            return ResponseEntity.ok(
                    classrooms
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
    // GET CLASSROOM BY ID
    // =====================================================

    @GetMapping("/{classroomId}")
    public ResponseEntity<?> getClassroom(
            @PathVariable Long classroomId) {

        try {

            return ResponseEntity.ok(
                    classroomService
                            .getClassroomById(
                                    classroomId
                            )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // JOIN CLASSROOM
    // =====================================================

    @PostMapping("/join")
    public ResponseEntity<?> joinClassroom(
            @RequestBody JoinClassroomRequest request) {

        try {

            ClassroomEnrollment enrollment =
                    classroomEnrollmentService
                            .joinClassroom(
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
    // GET CLASSROOM STUDENTS
    // =====================================================

    @GetMapping("/{classroomId}/students")
    public ResponseEntity<?> getClassroomStudents(
            @PathVariable Long classroomId) {

        try {

            return ResponseEntity.ok(
                    classroomEnrollmentService
                            .getClassroomStudents(
                                    classroomId
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
    // REMOVE STUDENT
    // =====================================================

    @DeleteMapping(
            "/{classroomId}/students/{studentId}"
    )
    public ResponseEntity<?> removeStudent(
            @PathVariable Long classroomId,
            @PathVariable Long studentId,
            @RequestBody RemoveStudentRequest request) {

        try {

            if (request == null ||
                    request.getTeacherId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "error",
                                        "Teacher ID is required"
                                )
                        );
            }

            classroomEnrollmentService.removeStudent(
                    classroomId,
                    studentId,
                    request.getTeacherId()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Student removed from classroom successfully"
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
    // GET STUDENT CLASSROOMS
    // =====================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentClassrooms(
            @PathVariable Long studentId) {

        try {

            return ResponseEntity.ok(
                    classroomEnrollmentService
                            .getStudentClassrooms(
                                    studentId
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
    // CREATE CLASSROOM REQUEST
    // =====================================================

    public static class CreateClassroomRequest {

        private String name;
        private Long teacherId;

        public CreateClassroomRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(
                String name) {

            this.name = name;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId = teacherId;
        }
    }

    // =====================================================
    // JOIN CLASSROOM REQUEST
    // =====================================================

    public static class JoinClassroomRequest {

        private String joinCode;
        private Long studentId;

        public JoinClassroomRequest() {
        }

        public String getJoinCode() {
            return joinCode;
        }

        public void setJoinCode(
                String joinCode) {

            this.joinCode = joinCode;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(
                Long studentId) {

            this.studentId = studentId;
        }
    }

    // =====================================================
    // REMOVE STUDENT REQUEST
    // =====================================================

    public static class RemoveStudentRequest {

        private Long teacherId;

        public RemoveStudentRequest() {
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(
                Long teacherId) {

            this.teacherId = teacherId;
        }
    }
}