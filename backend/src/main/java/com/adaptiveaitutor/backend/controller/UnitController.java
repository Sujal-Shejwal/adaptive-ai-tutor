package com.adaptiveaitutor.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@CrossOrigin(origins = "http://localhost:5173")
public class UnitController {

    private final UnitService unitService;

    public UnitController(
            UnitService unitService) {

        this.unitService =
                unitService;
    }

    // =====================================================
    // GET UNITS BY SUBJECT
    // =====================================================

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Unit>>
            getUnitsBySubject(
                    @PathVariable Long subjectId) {

        return ResponseEntity.ok(
                unitService.getUnitsBySubjectId(
                        subjectId
                )
        );
    }

    // =====================================================
    // GET UNIT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Unit>
            getUnitById(
                    @PathVariable Long id) {

        return unitService
                .getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // CREATE UNIT
    // =====================================================

    @PostMapping
    public ResponseEntity<Unit>
            createUnit(
                    @RequestBody Unit unit) {

        return ResponseEntity.ok(
                unitService.createUnit(
                        unit
                )
        );
    }

    // =====================================================
    // DELETE UNIT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
            deleteUnit(
                    @PathVariable Long id) {

        try {

            boolean deleted =
                    unitService.deleteUnit(
                            id
                    );

            if (!deleted) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }
}