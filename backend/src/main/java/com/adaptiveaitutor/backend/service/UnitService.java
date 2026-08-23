package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Unit;
import com.adaptiveaitutor.backend.repository.UnitRepository;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public List<Unit> getUnitsBySubjectId(Long subjectId) {
        return unitRepository.findBySubjectId(subjectId);
    }

    public Optional<Unit> getUnitById(Long id) {
        return unitRepository.findById(id);
    }

    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }
}