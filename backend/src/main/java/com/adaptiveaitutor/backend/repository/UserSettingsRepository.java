package com.adaptiveaitutor.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.UserSettings;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    Optional<UserSettings> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}