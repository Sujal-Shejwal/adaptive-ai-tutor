package com.adaptiveaitutor.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.entity.VideoProgress;
import com.adaptiveaitutor.backend.entity.VideoResource;
import com.adaptiveaitutor.backend.repository.UserRepository;
import com.adaptiveaitutor.backend.repository.VideoProgressRepository;
import com.adaptiveaitutor.backend.repository.VideoResourceRepository;

@Service
public class VideoProgressService {

    private final VideoProgressRepository videoProgressRepository;
    private final VideoResourceRepository videoResourceRepository;
    private final UserRepository userRepository;

    public VideoProgressService(
            VideoProgressRepository videoProgressRepository,
            VideoResourceRepository videoResourceRepository,
            UserRepository userRepository
    ) {
        this.videoProgressRepository =
                videoProgressRepository;

        this.videoResourceRepository =
                videoResourceRepository;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // SAVE / UPDATE VIDEO PROGRESS
    // =====================================================

    public VideoProgress updateProgress(
            Long videoId,
            Long studentId,
            Integer watchedSeconds,
            Integer progressPercentage,
            Boolean completed
    ) {

        VideoResource video =
                videoResourceRepository
                        .findById(videoId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Video not found."
                                )
                        );

        User student =
                userRepository
                        .findById(studentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student not found."
                                )
                        );

        if (
                student.getRole() == null ||
                !student.getRole()
                        .equalsIgnoreCase("STUDENT")
        ) {
            throw new IllegalArgumentException(
                    "Only students can save video progress."
            );
        }

        VideoProgress progress =
                videoProgressRepository
                        .findByVideoIdAndStudentId(
                                videoId,
                                studentId
                        )
                        .orElseGet(
                                VideoProgress::new
                        );

        progress.setVideo(video);
        progress.setStudent(student);

        progress.setWatchedSeconds(
                Math.max(
                        0,
                        watchedSeconds == null
                                ? 0
                                : watchedSeconds
                )
        );

        progress.setProgressPercentage(
                Math.min(
                        100,
                        Math.max(
                                0,
                                progressPercentage == null
                                        ? 0
                                        : progressPercentage
                        )
                )
        );

        progress.setCompleted(
                Boolean.TRUE.equals(completed)
        );

        progress.setLastWatchedAt(
                LocalDateTime.now()
        );

        return videoProgressRepository.save(
                progress
        );
    }

    // =====================================================
    // GET PROGRESS FOR ONE STUDENT + VIDEO
    // =====================================================

    public VideoProgress getStudentProgress(
            Long videoId,
            Long studentId
    ) {

        return videoProgressRepository
                .findByVideoIdAndStudentId(
                        videoId,
                        studentId
                )
                .orElse(null);
    }

    // =====================================================
    // GET ALL STUDENT PROGRESS FOR A VIDEO
    // =====================================================

    public List<VideoProgress> getVideoProgress(
            Long videoId
    ) {

        return videoProgressRepository
                .findByVideoId(videoId);
    }
}