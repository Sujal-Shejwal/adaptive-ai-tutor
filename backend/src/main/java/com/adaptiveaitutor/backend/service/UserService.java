package com.adaptiveaitutor.backend.service;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        return userRepository.save(user);
    }
}