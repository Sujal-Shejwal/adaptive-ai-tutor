package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.repository.TopicRepository;

@Service
public class TopicService {

    private final TopicRepository topicRepository;

    public TopicService(
            TopicRepository topicRepository) {

        this.topicRepository =
                topicRepository;
    }

    // =====================================================
    // GET TOPICS BY UNIT
    // =====================================================

    public List<Topic> getTopicsByUnitId(
            Long unitId) {

        return topicRepository
                .findByUnitId(unitId);
    }

    // =====================================================
    // GET TOPIC BY ID
    // =====================================================

    public Optional<Topic> getTopicById(
            Long id) {

        return topicRepository
                .findById(id);
    }

    // =====================================================
    // CREATE TOPIC
    // =====================================================

    public Topic createTopic(
            Topic topic) {

        return topicRepository.save(
                topic
        );
    }

    // =====================================================
    // DELETE TOPIC
    // =====================================================

    public boolean deleteTopic(
            Long id) {

        // -------------------------------------------------
        // CHECK WHETHER TOPIC EXISTS
        // -------------------------------------------------

        if (!topicRepository.existsById(id)) {

            return false;
        }

        // -------------------------------------------------
        // DELETE TOPIC
        // -------------------------------------------------

        topicRepository.deleteById(id);

        return true;
    }
}