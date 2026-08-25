package com.adaptiveaitutor.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Subject;
import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.entity.TopicProgress;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.SubjectRepository;
import com.adaptiveaitutor.backend.repository.TopicProgressRepository;
import com.adaptiveaitutor.backend.repository.TopicRepository;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class TopicProgressService {

    private final TopicProgressRepository topicProgressRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicProgressService(
            TopicProgressRepository topicProgressRepository,
            UserRepository userRepository,
            TopicRepository topicRepository,
            SubjectRepository subjectRepository) {

        this.topicProgressRepository = topicProgressRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    // =====================================================
    // GET PROGRESS FOR ONE TOPIC
    // =====================================================

    public Optional<TopicProgress> getProgress(
            Long userId,
            Long topicId) {

        return topicProgressRepository
                .findByUserIdAndTopicId(
                        userId,
                        topicId
                );
    }

    // =====================================================
    // MARK TOPIC COMPLETE
    // =====================================================

    public TopicProgress markComplete(
            Long userId,
            Long topicId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        Topic topic = topicRepository
                .findById(topicId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Topic not found"
                        )
                );

        Optional<TopicProgress> existingProgress =
                topicProgressRepository
                        .findByUserIdAndTopicId(
                                userId,
                                topicId
                        );

        if (existingProgress.isPresent()) {

            TopicProgress progress =
                    existingProgress.get();

            progress.setCompleted(true);

            return topicProgressRepository.save(
                    progress
            );
        }

        TopicProgress progress =
                new TopicProgress(
                        user,
                        topic,
                        true
                );

        return topicProgressRepository.save(
                progress
        );
    }

    // =====================================================
    // GET SUBJECT PROGRESS FOR USER
    // =====================================================

    public Map<Long, Integer> getSubjectProgress(
            Long userId) {

        Map<Long, Integer> subjectProgress =
                new HashMap<>();

        List<Subject> subjects =
                subjectRepository.findAll();

        for (Subject subject : subjects) {

            Long subjectId =
                    subject.getId();

            long totalTopics =
                    topicRepository
                            .countByUnitSubjectId(
                                    subjectId
                            );

            List<TopicProgress> progressList =
                    topicProgressRepository
                            .findByUserIdAndTopicUnitSubjectId(
                                    userId,
                                    subjectId
                            );

            long completedTopics =
                    progressList
                            .stream()
                            .filter(
                                    TopicProgress::isCompleted
                            )
                            .count();

            int percentage = 0;

            if (totalTopics > 0) {

                percentage =
                        (int) Math.round(
                                (completedTopics * 100.0)
                                        / totalTopics
                        );
            }

            subjectProgress.put(
                    subjectId,
                    percentage
            );
        }

        return subjectProgress;
    }

    // =====================================================
    // GET RECENT COMPLETED TOPICS
    // =====================================================

    public List<TopicProgress> getRecentActivity(
            Long userId) {

        return topicProgressRepository
                .findTop5ByUserIdAndCompletedTrueOrderByCompletedAtDesc(
                        userId
                );
    }
}