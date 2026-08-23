package com.adaptiveaitutor.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findBySubjectId(Long subjectId);
}