package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Topic;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findByUnitId(Long unitId);

}