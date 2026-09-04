package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class ClassroomEnrollmentService {

    private final ClassroomEnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public ClassroomEnrollmentService(
            ClassroomEnrollmentRepository enrollmentRepository,
            ClassroomRepository classroomRepository,
            UserRepository userRepository) {

        this.enrollmentRepository =
                enrollmentRepository;

        this.classroomRepository =
                classroomRepository;

        this.userRepository =
                userRepository;
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

    public List<ClassroomEnrollment>
            getClassroomStudents(
                    Long classroomId) {

        getClassroom(classroomId);

        return enrollmentRepository
                .findByClassroomId(
                        classroomId
                );
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