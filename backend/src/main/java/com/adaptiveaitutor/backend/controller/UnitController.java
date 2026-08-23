package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.entity.Unit;
import com.adaptiveaitutor.backend.service.UnitService;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Unit>> getUnitsBySubject(
            @PathVariable Long subjectId) {

        return ResponseEntity.ok(
                unitService.getUnitsBySubjectId(subjectId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(
            @PathVariable Long id) {

        return unitService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Unit> createUnit(
            @RequestBody Unit unit) {

        return ResponseEntity.ok(
                unitService.createUnit(unit)
        );
    }
}