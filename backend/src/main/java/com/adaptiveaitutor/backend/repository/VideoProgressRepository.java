package com.adaptiveaitutor.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adaptiveaitutor.backend.entity.VideoProgress;

public interface VideoProgressRepository
        extends JpaRepository<VideoProgress, Long> {

    Optional<VideoProgress>
    findByVideoIdAndStudentId(
            Long videoId,
            Long studentId
    );

    List<VideoProgress>
    findByVideoId(
            Long videoId
    );
}