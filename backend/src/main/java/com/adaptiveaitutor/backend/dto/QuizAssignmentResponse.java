package com.adaptiveaitutor.backend.dto;

import java.time.LocalDateTime;

public class QuizAssignmentResponse {

    private final Long assignmentId;

    private final Long classroomId;

    private final String classroomName;

    private final Long quizId;

    private final String quizTitle;

    private final Integer duration;

    private final LocalDateTime dueAt;

    private final LocalDateTime assignedAt;

    private final String status;

    private final Long subjectId;

    private final String subjectName;

    private final Long topicId;

    private final String topicName;

    public QuizAssignmentResponse(
            Long assignmentId,
            Long classroomId,
            String classroomName,
            Long quizId,
            String quizTitle,
            Integer duration,
            LocalDateTime dueAt,
            LocalDateTime assignedAt,
            String status,
            Long subjectId,
            String subjectName,
            Long topicId,
            String topicName) {

        this.assignmentId =
                assignmentId;

        this.classroomId =
                classroomId;

        this.classroomName =
                classroomName;

        this.quizId =
                quizId;

        this.quizTitle =
                quizTitle;

        this.duration =
                duration;

        this.dueAt =
                dueAt;

        this.assignedAt =
                assignedAt;

        this.status =
                status;

        this.subjectId =
                subjectId;

        this.subjectName =
                subjectName;

        this.topicId =
                topicId;

        this.topicName =
                topicName;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public Long getClassroomId() {
        return classroomId;
    }

    public String getClassroomName() {
        return classroomName;
    }

    public Long getQuizId() {
        return quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public Integer getDuration() {
        return duration;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public String getStatus() {
        return status;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public Long getTopicId() {
        return topicId;
    }

    public String getTopicName() {
        return topicName;
    }
}