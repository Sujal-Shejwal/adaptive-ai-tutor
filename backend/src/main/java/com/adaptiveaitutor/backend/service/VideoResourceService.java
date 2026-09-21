package com.adaptiveaitutor.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Topic;
import com.adaptiveaitutor.backend.entity.VideoResource;
import com.adaptiveaitutor.backend.repository.TopicRepository;
import com.adaptiveaitutor.backend.repository.VideoResourceRepository;

@Service
public class VideoResourceService {

    private final VideoResourceRepository videoResourceRepository;
    private final TopicRepository topicRepository;

    public VideoResourceService(
            VideoResourceRepository videoResourceRepository,
            TopicRepository topicRepository
    ) {
        this.videoResourceRepository = videoResourceRepository;
        this.topicRepository = topicRepository;
    }

    public VideoResource createVideo(
            String title,
            String videoUrl,
            Long topicId
    ) {

        if (videoUrl == null ||
                videoUrl.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Video URL is required."
            );
        }

        Topic topic =
                topicRepository.findById(topicId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Topic not found."
                                )
                        );

        VideoResource video =
                new VideoResource();

        video.setTitle(
                title == null || title.trim().isEmpty()
                        ? "Video"
                        : title.trim()
        );

        video.setVideoUrl(
                videoUrl.trim()
        );

        video.setTopic(topic);

        video.setCreatedAt(
                java.time.LocalDateTime.now()
        );

        return videoResourceRepository.save(video);
    }

    public List<VideoResource> getVideosByTopic(
            Long topicId
    ) {
        return videoResourceRepository
                .findByTopicId(topicId);
    }

    public VideoResource getVideoById(
            Long id
    ) {
        return videoResourceRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Video not found."
                        )
                );
    }

    public void deleteVideo(
            Long id
    ) {
        if (!videoResourceRepository
                .existsById(id)) {

            throw new IllegalArgumentException(
                    "Video not found."
            );
        }

        videoResourceRepository.deleteById(id);
    }
}