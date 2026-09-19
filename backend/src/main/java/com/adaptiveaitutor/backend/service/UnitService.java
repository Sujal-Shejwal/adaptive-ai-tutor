package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Unit;
import com.adaptiveaitutor.backend.repository.UnitRepository;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(
            UnitRepository unitRepository) {

        this.unitRepository =
                unitRepository;
    }

    // =====================================================
    // GET UNITS BY SUBJECT
    // =====================================================

    public List<Unit> getUnitsBySubjectId(
            Long subjectId) {

        return unitRepository
                .findBySubjectId(subjectId);
    }

    // =====================================================
    // GET UNIT BY ID
    // =====================================================

    public Optional<Unit> getUnitById(
            Long id) {

        return unitRepository
                .findById(id);
    }

    // =====================================================
    // CREATE UNIT
    // =====================================================

    public Unit createUnit(
            Unit unit) {

        return unitRepository.save(
                unit
        );
    }

    // =====================================================
    // DELETE UNIT
    // =====================================================

    public boolean deleteUnit(
            Long id) {

        // -------------------------------------------------
        // CHECK WHETHER UNIT EXISTS
        // -------------------------------------------------

        if (!unitRepository.existsById(id)) {

            return false;
        }

        // -------------------------------------------------
        // DELETE UNIT
        // -------------------------------------------------

        unitRepository.deleteById(id);

        return true;
    }
}