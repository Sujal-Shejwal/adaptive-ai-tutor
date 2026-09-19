package com.adaptiveaitutor.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.service.DashboardStatisticsService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardStatisticsController {

    private final DashboardStatisticsService dashboardStatisticsService;

    public DashboardStatisticsController(
            DashboardStatisticsService dashboardStatisticsService) {

        this.dashboardStatisticsService =
                dashboardStatisticsService;
    }

    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                dashboardStatisticsService
                        .getStatistics(userId)
        );
    }
}