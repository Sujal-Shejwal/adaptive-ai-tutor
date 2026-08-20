package com.adaptiveaitutor.backend.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adaptiveaitutor.backend.dto.LoginResponse;
import com.adaptiveaitutor.backend.entity.User;
import com.adaptiveaitutor.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        try {
            User savedUser = userService.registerUser(user);

            LoginResponse response = new LoginResponse(
                    savedUser.getId(),
                    savedUser.getName(),
                    savedUser.getEmail(),
                    savedUser.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        try {
            User loggedInUser = userService.loginUser(
                    user.getEmail(),
                    user.getPassword()
            );

            LoginResponse response = new LoginResponse(
                    loggedInUser.getId(),
                    loggedInUser.getName(),
                    loggedInUser.getEmail(),
                    loggedInUser.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }
    }
}