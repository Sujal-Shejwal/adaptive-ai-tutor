package com.adaptiveaitutor.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "user_settings",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "user_id")
    }
)
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One settings record belongs to one user
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // =========================
    // Notifications
    // =========================

    private Boolean quizReminders = true;

    private Boolean newContentAlerts = true;

    private Boolean teacherAnnouncements = true;

    private Boolean weeklyProgressReports = false;

    // =========================
    // Learning Preferences
    // =========================

    private String answerStyle = "Detailed";

    private Boolean studyReminder = true;

    private Boolean recommendations = true;

    // =========================
    // Account Preferences
    // =========================

    private String language = "English (India)";

    private String timeZone = "Asia/Kolkata (IST UTC+5:30)";

    private String academicYear = "2026–2027";

    // =========================
    // Privacy & Data
    // =========================

    private Boolean saveChatHistory = true;

    private Boolean personalizedData = true;

    // =========================
    // Constructors
    // =========================

    public UserSettings() {
    }

    public UserSettings(User user) {
        this.user = user;
    }

    // =========================
    // Getters and Setters
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getQuizReminders() {
        return quizReminders;
    }

    public void setQuizReminders(Boolean quizReminders) {
        this.quizReminders = quizReminders;
    }

    public Boolean getNewContentAlerts() {
        return newContentAlerts;
    }

    public void setNewContentAlerts(Boolean newContentAlerts) {
        this.newContentAlerts = newContentAlerts;
    }

    public Boolean getTeacherAnnouncements() {
        return teacherAnnouncements;
    }

    public void setTeacherAnnouncements(Boolean teacherAnnouncements) {
        this.teacherAnnouncements = teacherAnnouncements;
    }

    public Boolean getWeeklyProgressReports() {
        return weeklyProgressReports;
    }

    public void setWeeklyProgressReports(Boolean weeklyProgressReports) {
        this.weeklyProgressReports = weeklyProgressReports;
    }

    public String getAnswerStyle() {
        return answerStyle;
    }

    public void setAnswerStyle(String answerStyle) {
        this.answerStyle = answerStyle;
    }

    public Boolean getStudyReminder() {
        return studyReminder;
    }

    public void setStudyReminder(Boolean studyReminder) {
        this.studyReminder = studyReminder;
    }

    public Boolean getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(Boolean recommendations) {
        this.recommendations = recommendations;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Boolean getSaveChatHistory() {
        return saveChatHistory;
    }

    public void setSaveChatHistory(Boolean saveChatHistory) {
        this.saveChatHistory = saveChatHistory;
    }

    public Boolean getPersonalizedData() {
        return personalizedData;
    }

    public void setPersonalizedData(Boolean personalizedData) {
        this.personalizedData = personalizedData;
    }
}