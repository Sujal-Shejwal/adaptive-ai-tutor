package com.adaptiveaitutor.backend.service;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    private final SecureRandom secureRandom =
            new SecureRandom();

    private static final String CODE_CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final int JOIN_CODE_LENGTH = 6;

    public ClassroomService(
            ClassroomRepository classroomRepository,
            UserRepository userRepository) {

        this.classroomRepository =
                classroomRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // CREATE CLASSROOM
    // =====================================================

    public Classroom createClassroom(
            String name,
            Long teacherId) {

        // -------------------------------------------------
        // VALIDATE CLASSROOM NAME
        // -------------------------------------------------

        if (name == null || name.trim().isEmpty()) {

            throw new RuntimeException(
                    "Classroom name cannot be empty"
            );
        }

        // -------------------------------------------------
        // FIND TEACHER
        // -------------------------------------------------

        User teacher =
                userRepository
                        .findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );

        // -------------------------------------------------
        // VERIFY TEACHER ROLE
        // -------------------------------------------------

        if (!"teacher".equalsIgnoreCase(
                teacher.getRole()
        )) {

            throw new RuntimeException(
                    "Only teachers can create classrooms"
            );
        }

        // -------------------------------------------------
        // GENERATE UNIQUE JOIN CODE
        // -------------------------------------------------

        String joinCode =
                generateUniqueJoinCode();

        // -------------------------------------------------
        // CREATE CLASSROOM
        // -------------------------------------------------

        Classroom classroom =
                new Classroom(
                        name.trim(),
                        joinCode,
                        teacher
                );

        return classroomRepository.save(
                classroom
        );
    }

    // =====================================================
    // GET TEACHER CLASSROOMS
    // =====================================================

    public List<Classroom> getTeacherClassrooms(
            Long teacherId) {

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
                    "Only teachers can access teacher classrooms"
            );
        }

        return classroomRepository
                .findByTeacherId(teacherId);
    }

    // =====================================================
    // GET CLASSROOM BY ID
    // =====================================================

    public Classroom getClassroomById(
            Long classroomId) {

        return classroomRepository
                .findById(classroomId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Classroom not found"
                        )
                );
    }

    // =====================================================
    // GET CLASSROOM BY JOIN CODE
    // =====================================================

    public Classroom getClassroomByJoinCode(
            String joinCode) {

        if (joinCode == null ||
                joinCode.trim().isEmpty()) {

            throw new RuntimeException(
                    "Join code is required"
            );
        }

        return classroomRepository
                .findByJoinCode(
                        joinCode.trim().toUpperCase()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid classroom join code"
                        )
                );
    }

    // =====================================================
    // GENERATE UNIQUE JOIN CODE
    // =====================================================

    private String generateUniqueJoinCode() {

        String joinCode;

        do {

            joinCode =
                    generateJoinCode();

        } while (
                classroomRepository
                        .existsByJoinCode(joinCode)
        );

        return joinCode;
    }

    // =====================================================
    // GENERATE RANDOM CODE
    // =====================================================

    private String generateJoinCode() {

        StringBuilder code =
                new StringBuilder(
                        JOIN_CODE_LENGTH
                );

        for (int i = 0;
                i < JOIN_CODE_LENGTH;
                i++) {

            int index =
                    secureRandom.nextInt(
                            CODE_CHARACTERS.length()
                    );

            code.append(
                    CODE_CHARACTERS.charAt(index)
            );
        }

        return code.toString();
    }
}