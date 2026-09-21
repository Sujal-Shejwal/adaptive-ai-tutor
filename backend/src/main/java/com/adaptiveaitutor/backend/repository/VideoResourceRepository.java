package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.VideoResource;

public interface VideoResourceRepository
        extends JpaRepository<VideoResource, Long> {

    List<VideoResource> findByTopicId(Long topicId);
}