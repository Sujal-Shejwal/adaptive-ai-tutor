package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.TopicProgress;

public interface TopicProgressRepository
        extends JpaRepository<TopicProgress, Long> {

    Optional<TopicProgress> findByUserIdAndTopicId(
            Long userId,
            Long topicId
    );

    List<TopicProgress> findByUserId(Long userId);

    long countByUserIdAndCompletedTrue(Long userId);

    List<TopicProgress> findByUserIdAndTopicUnitSubjectId(
            Long userId,
            Long subjectId
    );

    List<TopicProgress>
    findTop5ByUserIdAndCompletedTrueOrderByCompletedAtDesc(
            Long userId
    );
}