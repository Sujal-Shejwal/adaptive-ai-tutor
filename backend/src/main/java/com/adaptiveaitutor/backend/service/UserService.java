package com.adaptiveaitutor.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.exception.EmailAlreadyExistsException;
import com.adaptiveaitutor.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;
    }

    // =====================================================
    // REGISTER USER
    // =====================================================

    public User registerUser(
            User user) {

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (userRepository.existsByEmail(
                user.getEmail())) {

            throw new EmailAlreadyExistsException(
                    "Email already registered"
            );
        }

        // -------------------------------------------------
        // HASH PASSWORD
        // -------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(
                user
        );
    }

    // =====================================================
    // LOGIN USER
    // =====================================================

    public User loginUser(
            String email,
            String password) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );

        // -------------------------------------------------
        // VERIFY PASSWORD
        // -------------------------------------------------

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid password"
            );
        }

        return user;
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    public User getUserById(
            Long userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public User updateProfile(
            Long userId,
            String name,
            String email) {

        User user =
                getUserById(userId);

        // -------------------------------------------------
        // VALIDATE NAME
        // -------------------------------------------------

        if (
                name == null ||
                name.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Name cannot be empty"
            );
        }

        // -------------------------------------------------
        // VALIDATE EMAIL
        // -------------------------------------------------

        if (
                email == null ||
                email.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }

        String trimmedName =
                name.trim();

        String trimmedEmail =
                email.trim();

        // -------------------------------------------------
        // CHECK WHETHER EMAIL CHANGED
        // -------------------------------------------------

        if (
                !trimmedEmail.equalsIgnoreCase(
                        user.getEmail()
                )
        ) {

            boolean emailExists =
                    userRepository
                            .existsByEmail(
                                    trimmedEmail
                            );

            if (emailExists) {

                throw new EmailAlreadyExistsException(
                        "Email already registered"
                );
            }

            user.setEmail(
                    trimmedEmail
            );
        }

        // -------------------------------------------------
        // UPDATE NAME
        // -------------------------------------------------

        user.setName(
                trimmedName
        );

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return userRepository.save(
                user
        );
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public void changePassword(
            Long userId,
            String currentPassword,
            String newPassword) {

        User user =
                getUserById(userId);

        // -------------------------------------------------
        // VALIDATE CURRENT PASSWORD
        // -------------------------------------------------

        if (
                currentPassword == null ||
                currentPassword.isBlank()
        ) {

            throw new RuntimeException(
                    "Current password is required"
            );
        }

        // -------------------------------------------------
        // VALIDATE NEW PASSWORD
        // -------------------------------------------------

        if (
                newPassword == null ||
                newPassword.isBlank()
        ) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        if (
                newPassword.length() < 6
        ) {

            throw new RuntimeException(
                    "New password must contain at least 6 characters"
            );
        }

        // -------------------------------------------------
        // VERIFY CURRENT PASSWORD
        // -------------------------------------------------

        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        // -------------------------------------------------
        // HASH NEW PASSWORD
        // -------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        userRepository.save(
                user
        );
    }
}