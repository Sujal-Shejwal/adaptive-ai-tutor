package com.adaptiveaitutor.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.PerformanceAnalysisService;
import com.adaptiveaitutor.backend.service.PerformanceAnalysisService.PerformanceAnalysis;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceAnalysisController {

    private final PerformanceAnalysisService
            performanceAnalysisService;

    public PerformanceAnalysisController(
            PerformanceAnalysisService performanceAnalysisService) {

        this.performanceAnalysisService =
                performanceAnalysisService;
    }

    // =====================================================
    // GET STUDENT PERFORMANCE ANALYSIS
    // =====================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentPerformance(
            @PathVariable Long studentId) {

        try {

            PerformanceAnalysis analysis =
                    performanceAnalysisService
                            .analyzeStudentPerformance(
                                    studentId
                            );

            return ResponseEntity.ok(
                    analysis
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }
}