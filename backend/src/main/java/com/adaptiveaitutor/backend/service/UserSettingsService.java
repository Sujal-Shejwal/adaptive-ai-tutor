package com.adaptiveaitutor.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.entity.UserSettings;
import com.adaptiveaitutor.backend.repository.UserRepository;
import com.adaptiveaitutor.backend.repository.UserSettingsRepository;

@Service
@Transactional
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    public UserSettingsService(
            UserSettingsRepository userSettingsRepository,
            UserRepository userRepository) {

        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
    }

    // Get existing settings or create default settings for the user
    public UserSettings getOrCreateSettings(Long userId) {

        return userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found with ID: " + userId));

                    UserSettings settings = new UserSettings(user);

                    return userSettingsRepository.save(settings);
                });
    }

    // Update all settings of a user
    public UserSettings updateSettings(
            Long userId,
            Boolean quizReminders,
            Boolean newContentAlerts,
            Boolean teacherAnnouncements,
            Boolean weeklyProgressReports,
            String answerStyle,
            Boolean studyReminder,
            Boolean recommendations,
            String language,
            String timeZone,
            String academicYear,
            Boolean saveChatHistory,
            Boolean personalizedData) {

        UserSettings settings = getOrCreateSettings(userId);

        settings.setQuizReminders(
                quizReminders != null ? quizReminders : settings.getQuizReminders());

        settings.setNewContentAlerts(
                newContentAlerts != null ? newContentAlerts : settings.getNewContentAlerts());

        settings.setTeacherAnnouncements(
                teacherAnnouncements != null
                        ? teacherAnnouncements
                        : settings.getTeacherAnnouncements());

        settings.setWeeklyProgressReports(
                weeklyProgressReports != null
                        ? weeklyProgressReports
                        : settings.getWeeklyProgressReports());

        if (answerStyle != null && !answerStyle.isBlank()) {
            settings.setAnswerStyle(answerStyle.trim());
        }

        settings.setStudyReminder(
                studyReminder != null ? studyReminder : settings.getStudyReminder());

        settings.setRecommendations(
                recommendations != null
                        ? recommendations
                        : settings.getRecommendations());

        if (language != null && !language.isBlank()) {
            settings.setLanguage(language.trim());
        }

        if (timeZone != null && !timeZone.isBlank()) {
            settings.setTimeZone(timeZone.trim());
        }

        if (academicYear != null && !academicYear.isBlank()) {
            settings.setAcademicYear(academicYear.trim());
        }

        settings.setSaveChatHistory(
                saveChatHistory != null
                        ? saveChatHistory
                        : settings.getSaveChatHistory());

        settings.setPersonalizedData(
                personalizedData != null
                        ? personalizedData
                        : settings.getPersonalizedData());

        return userSettingsRepository.save(settings);
    }
}