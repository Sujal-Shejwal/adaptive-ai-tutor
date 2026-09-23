package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.dto.ClassroomChatMessageResponse;
import com.adaptiveaitutor.backend.entity.Classroom;
import com.adaptiveaitutor.backend.entity.ClassroomChatMessage;
import com.adaptiveaitutor.backend.entity.ClassroomEnrollment;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.ClassroomChatMessageRepository;
import com.adaptiveaitutor.backend.repository.ClassroomEnrollmentRepository;
import com.adaptiveaitutor.backend.repository.ClassroomRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class ClassroomChatService {

    private final ClassroomChatMessageRepository
            chatMessageRepository;

    private final ClassroomRepository
            classroomRepository;

    private final ClassroomEnrollmentRepository
            enrollmentRepository;

    private final UserRepository
            userRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ClassroomChatService(
            ClassroomChatMessageRepository chatMessageRepository,
            ClassroomRepository classroomRepository,
            ClassroomEnrollmentRepository enrollmentRepository,
            UserRepository userRepository) {

        this.chatMessageRepository =
                chatMessageRepository;

        this.classroomRepository =
                classroomRepository;

        this.enrollmentRepository =
                enrollmentRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // GET CHAT HISTORY
    // =====================================================

    @Transactional(readOnly = true)
    public List<ClassroomChatMessageResponse>
            getMessages(
                    Long classroomId,
                    Long userId) {

        validateClassroomAccess(
                classroomId,
                userId
        );

        return chatMessageRepository
                .findByClassroomIdOrderByCreatedAtAsc(
                        classroomId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .collect(
                        Collectors.toList()
                );
    }


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    @Transactional
    public ClassroomChatMessageResponse
            sendMessage(
                    Long classroomId,
                    Long senderId,
                    String content) {

        // -------------------------------------------------
        // VALIDATE CONTENT
        // -------------------------------------------------

        if (
                content == null ||
                content.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Message cannot be empty"
            );
        }


        String cleanContent =
                content.trim();


        // -------------------------------------------------
        // VERIFY CLASSROOM
        // -------------------------------------------------

        Classroom classroom =
                classroomRepository
                        .findById(
                                classroomId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Classroom not found"
                                        )
                        );


        // -------------------------------------------------
        // VERIFY SENDER
        // -------------------------------------------------

        User sender =
                userRepository
                        .findById(
                                senderId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        // -------------------------------------------------
        // VERIFY ACCESS
        // -------------------------------------------------

        validateClassroomAccess(
                classroomId,
                senderId
        );


        // -------------------------------------------------
        // CREATE MESSAGE
        // -------------------------------------------------

        ClassroomChatMessage message =
                new ClassroomChatMessage(
                        classroom,
                        sender,
                        cleanContent
                );


        // -------------------------------------------------
        // SAVE MESSAGE
        // -------------------------------------------------

        ClassroomChatMessage saved =
                chatMessageRepository.save(
                        message
                );


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return toResponse(
                saved
        );
    }


    // =====================================================
    // CHECK CLASSROOM ACCESS
    // =====================================================

    private void validateClassroomAccess(
            Long classroomId,
            Long userId) {

        // -------------------------------------------------
        // GET CLASSROOM
        // -------------------------------------------------

        Classroom classroom =
                classroomRepository
                        .findById(
                                classroomId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Classroom not found"
                                        )
                        );


        // -------------------------------------------------
        // GET USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        // -------------------------------------------------
        // TEACHER ACCESS
        // -------------------------------------------------

        if (
                "teacher".equalsIgnoreCase(
                        user.getRole()
                )
        ) {

            if (
                    classroom.getTeacher() == null ||
                    classroom.getTeacher().getId() == null ||
                    !classroom.getTeacher()
                            .getId()
                            .equals(
                                    userId
                            )
            ) {

                throw new RuntimeException(
                        "Teacher does not own this classroom"
                );
            }

            return;
        }


        // -------------------------------------------------
        // STUDENT ACCESS
        // -------------------------------------------------

        if (
                "student".equalsIgnoreCase(
                        user.getRole()
                )
        ) {

            ClassroomEnrollment enrollment =
                    enrollmentRepository
                            .findByClassroomIdAndStudentId(
                                    classroomId,
                                    userId
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Student is not enrolled in this classroom"
                                            )
                            );


            if (
                    enrollment.getStatus() == null ||
                    !"ACTIVE".equalsIgnoreCase(
                            enrollment.getStatus()
                    )
            ) {

                throw new RuntimeException(
                        "Student is not active in this classroom"
                );
            }

            return;
        }


        // -------------------------------------------------
        // INVALID ROLE
        // -------------------------------------------------

        throw new RuntimeException(
                "Only teachers and students can use classroom chat"
        );
    }


    // =====================================================
    // ENTITY → RESPONSE
    // =====================================================

    private ClassroomChatMessageResponse
            toResponse(
                    ClassroomChatMessage message) {

        User sender =
                message.getSender();

        return new ClassroomChatMessageResponse(
                message.getId(),

                message.getClassroom()
                        .getId(),

                sender != null
                        ? sender.getId()
                        : null,

                sender != null
                        ? sender.getName()
                        : "User",

                sender != null
                        ? sender.getRole()
                        : null,

                message.getContent(),

                message.getCreatedAt()
        );
    }
}