package com.adaptiveaitutor.backend.dto;

public class ProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String studentId;
    private String phone;
    private String department;
    private String year;
    private boolean mustChangePassword;

    public ProfileResponse() {
    }

    public ProfileResponse(
            Long id,
            String name,
            String email,
            String role,
            String studentId,
            String phone,
            String department,
            String year,
            boolean mustChangePassword
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
        this.phone = phone;
        this.department = department;
        this.year = year;
        this.mustChangePassword = mustChangePassword;
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

    public String getPhone() {
        return phone;
    }

    public String getDepartment() {
        return department;
    }

    public String getYear() {
        return year;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }
}