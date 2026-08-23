package com.adaptiveaitutor.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}