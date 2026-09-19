package com.adaptiveaitutor.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.StudentProfile;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.StudentProfileRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class ClassroomEnrollmentService {

    private final ClassroomEnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ClassroomEnrollmentService(
            ClassroomEnrollmentRepository enrollmentRepository,
            ClassroomRepository classroomRepository,
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository) {

        this.enrollmentRepository =
                enrollmentRepository;

        this.classroomRepository =
                classroomRepository;

        this.userRepository =
                userRepository;

        this.studentProfileRepository =
                studentProfileRepository;
    }

    // =====================================================
    // JOIN CLASSROOM
    // =====================================================

    public ClassroomEnrollment joinClassroom(
            String joinCode,
            Long studentId) {

        if (joinCode == null ||
                joinCode.trim().isEmpty()) {

            throw new RuntimeException(
                    "Join code is required"
            );
        }

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
                    "Only students can join classrooms"
            );
        }

        Classroom classroom =
                classroomRepository
                        .findByJoinCode(
                                joinCode
                                        .trim()
                                        .toUpperCase()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid classroom join code"
                                )
                        );

        if (enrollmentRepository
                .existsByClassroomIdAndStudentId(
                        classroom.getId(),
                        studentId
                )) {

            throw new RuntimeException(
                    "Student is already enrolled in this classroom"
            );
        }

        ClassroomEnrollment enrollment =
                new ClassroomEnrollment(
                        classroom,
                        student
                );

        return enrollmentRepository.save(
                enrollment
        );
    }

    // =====================================================
    // GET CLASSROOM STUDENTS
    // =====================================================

    public List<Map<String, Object>>
            getClassroomStudents(
                    Long classroomId) {

        getClassroom(classroomId);

        List<ClassroomEnrollment> enrollments =
                enrollmentRepository
                        .findByClassroomId(
                                classroomId
                        );

        List<Map<String, Object>> response =
                new ArrayList<>();

        for (ClassroomEnrollment enrollment :
                enrollments) {

            Map<String, Object> enrollmentData =
                    new HashMap<>();

            enrollmentData.put(
                    "id",
                    enrollment.getId()
            );

            enrollmentData.put(
                    "status",
                    enrollment.getStatus()
            );

            User student =
                    enrollment.getStudent();

            Map<String, Object> studentData =
                    new HashMap<>();

            if (student != null) {

                // Internal database User ID.
                // Keep this because frontend uses it
                // for operations such as removing a student.
                studentData.put(
                        "id",
                        student.getId()
                );

                studentData.put(
                        "name",
                        student.getName()
                );

                studentData.put(
                        "email",
                        student.getEmail()
                );

                // Real Student ID from StudentProfile.
                Optional<StudentProfile> profile =
                        studentProfileRepository
                                .findByUserId(
                                        student.getId()
                                );

                studentData.put(
                        "studentId",
                        profile
                                .map(
                                        StudentProfile::getStudentId
                                )
                                .orElse(null)
                );
            }

            enrollmentData.put(
                    "student",
                    studentData
            );

            response.add(
                    enrollmentData
            );
        }

        return response;
    }

    // =====================================================
    // GET STUDENT CLASSROOMS
    // =====================================================

    public List<ClassroomEnrollment>
            getStudentClassrooms(
                    Long studentId) {

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
                    "Only students can access student classrooms"
            );
        }

        return enrollmentRepository
                .findByStudentId(studentId);
    }

    // =====================================================
    // GET SPECIFIC ENROLLMENT
    // =====================================================

    public ClassroomEnrollment
            getEnrollment(
                    Long classroomId,
                    Long studentId) {

        return enrollmentRepository
                .findByClassroomIdAndStudentId(
                        classroomId,
                        studentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Enrollment not found"
                        )
                );
    }

    // =====================================================
    // REMOVE STUDENT FROM CLASSROOM
    // =====================================================

    @Transactional
    public void removeStudent(
            Long classroomId,
            Long studentId,
            Long teacherId) {

        Classroom classroom =
                getClassroom(classroomId);

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
                    "You are not authorized to manage this classroom"
            );
        }

        // -------------------------------------------------
        // VERIFY TEACHER ROLE
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
                    "Only teachers can remove students"
            );
        }

        // -------------------------------------------------
        // FIND ENROLLMENT
        // -------------------------------------------------

        ClassroomEnrollment enrollment =
                enrollmentRepository
                        .findByClassroomIdAndStudentId(
                                classroomId,
                                studentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student is not enrolled in this classroom"
                                )
                        );

        // -------------------------------------------------
        // REMOVE ENROLLMENT
        // -------------------------------------------------

        enrollmentRepository.delete(
                enrollment
        );
    }

    // =====================================================
    // GET CLASSROOM
    // =====================================================

    private Classroom getClassroom(
            Long classroomId) {

        return classroomRepository
                .findById(classroomId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Classroom not found"
                        )
                );
    }
}