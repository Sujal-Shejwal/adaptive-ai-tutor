package com.adaptiveaitutor.backend.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.repository.NoteRepository;
import com.adaptiveaitutor.backend.repository.TopicProgressRepository;
import com.adaptiveaitutor.backend.repository.TopicRepository;

@Service
public class DashboardStatisticsService {

    private final TopicProgressRepository topicProgressRepository;
    private final TopicRepository topicRepository;
    private final NoteRepository noteRepository;

    public DashboardStatisticsService(
            TopicProgressRepository topicProgressRepository,
            TopicRepository topicRepository,
            NoteRepository noteRepository) {

        this.topicProgressRepository = topicProgressRepository;
        this.topicRepository = topicRepository;
        this.noteRepository = noteRepository;
    }

    public Map<String, Object> getStatistics(Long userId) {

        long completedTopics =
                topicProgressRepository
                        .countByUserIdAndCompletedTrue(userId);

        long totalTopics =
                topicRepository.count();

        long learningMaterials =
                noteRepository.count();

        int overallProgress = 0;

        if (totalTopics > 0) {
            overallProgress =
                    (int) Math.round(
                            (completedTopics * 100.0)
                                    / totalTopics
                    );
        }

        Map<String, Object> statistics =
                new LinkedHashMap<>();

        statistics.put(
                "completedTopics",
                completedTopics
        );

        statistics.put(
                "learningMaterials",
                learningMaterials
        );

        statistics.put(
                "totalTopics",
                totalTopics
        );

        statistics.put(
                "overallProgress",
                overallProgress
        );

        return statistics;
    }
}