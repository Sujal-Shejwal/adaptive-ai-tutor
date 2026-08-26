package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Quiz;

public interface QuizRepository
        extends JpaRepository<Quiz, Long> {

    List<Quiz> findBySubjectId(Long subjectId);

    List<Quiz> findByCreatedById(Long teacherId);

}