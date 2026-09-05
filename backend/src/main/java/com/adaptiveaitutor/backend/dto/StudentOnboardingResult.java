package com.adaptiveaitutor.backend.dto;

public class StudentOnboardingResult {

    private Long userId;
    private String name;
    private String email;
    private String studentId;
    private String temporaryPassword;
    private boolean newAccount;

    public StudentOnboardingResult() {
    }

    public StudentOnboardingResult(
            Long userId,
            String name,
            String email,
            String studentId,
            String temporaryPassword,
            boolean newAccount
    ) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.studentId = studentId;
        this.temporaryPassword = temporaryPassword;
        this.newAccount = newAccount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public boolean isNewAccount() {
        return newAccount;
    }

    public void setNewAccount(boolean newAccount) {
        this.newAccount = newAccount;
    }
}