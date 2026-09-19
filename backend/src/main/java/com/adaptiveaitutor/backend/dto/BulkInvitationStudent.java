package com.adaptiveaitutor.backend.dto;

/**
 * Represents one student in a bulk invitation upload/request.
 */
public class BulkInvitationStudent {

    private String name;
    private String email;

    public BulkInvitationStudent() {
    }

    public BulkInvitationStudent(String name, String email) {
        this.name = name;
        this.email = email;
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
}