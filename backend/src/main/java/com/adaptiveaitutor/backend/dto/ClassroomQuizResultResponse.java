package com.adaptiveaitutor.backend.dto;

import java.time.LocalDateTime;

public class ClassroomQuizResultResponse {
    private final Long assignmentId;
    private final Long classroomId;
    private final String classroomName;
    private final Long quizId;
    private final String quizTitle;
    private final Long studentId;
    private final String studentName;
    private final String studentEmail;
    private final String status;
    private final Integer score;
    private final Integer totalQuestions;
    private final Integer correctAnswers;
    private final LocalDateTime submittedAt;

    public ClassroomQuizResultResponse(Long assignmentId, Long classroomId, String classroomName,
            Long quizId, String quizTitle, Long studentId, String studentName, String studentEmail,
            String status, Integer score, Integer totalQuestions, Integer correctAnswers,
            LocalDateTime submittedAt) {
        this.assignmentId = assignmentId;
        this.classroomId = classroomId;
        this.classroomName = classroomName;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.status = status;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.submittedAt = submittedAt;
    }
    public Long getAssignmentId() { return assignmentId; }
    public Long getClassroomId() { return classroomId; }
    public String getClassroomName() { return classroomName; }
    public Long getQuizId() { return quizId; }
    public String getQuizTitle() { return quizTitle; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public String getStatus() { return status; }
    public Integer getScore() { return score; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public Integer getCorrectAnswers() { return correctAnswers; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
