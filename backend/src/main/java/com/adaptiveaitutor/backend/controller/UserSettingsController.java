package com.adaptiveaitutor.backend.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.UserSettings;
import com.adaptiveaitutor.backend.service.UserSettingsService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    // ==========================================
    // GET USER SETTINGS
    // ==========================================
    @GetMapping("/{userId}/settings")
    public ResponseEntity<Map<String, Object>> getSettings(
            @PathVariable Long userId) {

        UserSettings settings =
                userSettingsService.getOrCreateSettings(userId);

        return ResponseEntity.ok(toResponse(settings));
    }

    // ==========================================
    // UPDATE USER SETTINGS
    // ==========================================
    @PutMapping("/{userId}/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(
            @PathVariable Long userId,
            @RequestBody SettingsRequest request) {

        UserSettings settings =
                userSettingsService.updateSettings(
                        userId,
                        request.getQuizReminders(),
                        request.getNewContentAlerts(),
                        request.getTeacherAnnouncements(),
                        request.getWeeklyProgressReports(),
                        request.getAnswerStyle(),
                        request.getStudyReminder(),
                        request.getRecommendations(),
                        request.getLanguage(),
                        request.getTimeZone(),
                        request.getAcademicYear(),
                        request.getSaveChatHistory(),
                        request.getPersonalizedData()
                );

        return ResponseEntity.ok(toResponse(settings));
    }

    // ==========================================
    // CONVERT ENTITY TO RESPONSE
    // ==========================================
    private Map<String, Object> toResponse(UserSettings settings) {

        Map<String, Object> response = new LinkedHashMap<>();

        // Notifications
        response.put("quizReminders", settings.getQuizReminders());
        response.put("newContentAlerts", settings.getNewContentAlerts());
        response.put(
                "teacherAnnouncements",
                settings.getTeacherAnnouncements()
        );
        response.put(
                "weeklyProgressReports",
                settings.getWeeklyProgressReports()
        );

        // Learning Preferences
        response.put("answerStyle", settings.getAnswerStyle());
        response.put("studyReminder", settings.getStudyReminder());
        response.put("recommendations", settings.getRecommendations());

        // Account Preferences
        response.put("language", settings.getLanguage());
        response.put("timeZone", settings.getTimeZone());
        response.put("academicYear", settings.getAcademicYear());

        // Privacy & Data
        response.put("saveChatHistory", settings.getSaveChatHistory());
        response.put("personalizedData", settings.getPersonalizedData());

        return response;
    }

    // ==========================================
    // REQUEST BODY
    // ==========================================
    public static class SettingsRequest {

        // Notifications
        private Boolean quizReminders;
        private Boolean newContentAlerts;
        private Boolean teacherAnnouncements;
        private Boolean weeklyProgressReports;

        // Learning Preferences
        private String answerStyle;
        private Boolean studyReminder;
        private Boolean recommendations;

        // Account Preferences
        private String language;
        private String timeZone;
        private String academicYear;

        // Privacy & Data
        private Boolean saveChatHistory;
        private Boolean personalizedData;

        // -------------------------
        // Getters
        // -------------------------

        public Boolean getQuizReminders() {
            return quizReminders;
        }

        public Boolean getNewContentAlerts() {
            return newContentAlerts;
        }

        public Boolean getTeacherAnnouncements() {
            return teacherAnnouncements;
        }

        public Boolean getWeeklyProgressReports() {
            return weeklyProgressReports;
        }

        public String getAnswerStyle() {
            return answerStyle;
        }

        public Boolean getStudyReminder() {
            return studyReminder;
        }

        public Boolean getRecommendations() {
            return recommendations;
        }

        public String getLanguage() {
            return language;
        }

        public String getTimeZone() {
            return timeZone;
        }

        public String getAcademicYear() {
            return academicYear;
        }

        public Boolean getSaveChatHistory() {
            return saveChatHistory;
        }

        public Boolean getPersonalizedData() {
            return personalizedData;
        }

        // -------------------------
        // Setters
        // -------------------------

        public void setQuizReminders(Boolean quizReminders) {
            this.quizReminders = quizReminders;
        }

        public void setNewContentAlerts(Boolean newContentAlerts) {
            this.newContentAlerts = newContentAlerts;
        }

        public void setTeacherAnnouncements(Boolean teacherAnnouncements) {
            this.teacherAnnouncements = teacherAnnouncements;
        }

        public void setWeeklyProgressReports(Boolean weeklyProgressReports) {
            this.weeklyProgressReports = weeklyProgressReports;
        }

        public void setAnswerStyle(String answerStyle) {
            this.answerStyle = answerStyle;
        }

        public void setStudyReminder(Boolean studyReminder) {
            this.studyReminder = studyReminder;
        }

        public void setRecommendations(Boolean recommendations) {
            this.recommendations = recommendations;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public void setTimeZone(String timeZone) {
            this.timeZone = timeZone;
        }

        public void setAcademicYear(String academicYear) {
            this.academicYear = academicYear;
        }

        public void setSaveChatHistory(Boolean saveChatHistory) {
            this.saveChatHistory = saveChatHistory;
        }

        public void setPersonalizedData(Boolean personalizedData) {
            this.personalizedData = personalizedData;
        }
    }
}