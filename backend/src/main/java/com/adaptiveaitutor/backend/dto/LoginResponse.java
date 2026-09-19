package com.adaptiveaitutor.backend.dto;

public class LoginResponse {

    private final Long id;

    private final String name;

    private final String email;

    private final String role;

    private final String studentId;

    private final boolean mustChangePassword;

    public LoginResponse(
            Long id,
            String name,
            String email,
            String role) {

        this(
                id,
                name,
                email,
                role,
                null,
                false
        );
    }

    public LoginResponse(
            Long id,
            String name,
            String email,
            String role,
            String studentId,
            boolean mustChangePassword) {

        this.id = id;

        this.name = name;

        this.email = email;

        this.role = role;

        this.studentId = studentId;

        this.mustChangePassword =
                mustChangePassword;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getStudentId() {
        return studentId;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }
}