package com.adaptiveaitutor.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkInvitationResult {

    private int total;

    private int sent;

    private int failed;

    private List<StudentInvitationResult> results =
            new ArrayList<>();

    public BulkInvitationResult() {
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(
            int total) {

        this.total = total;
    }

    public int getSent() {
        return sent;
    }

    public void setSent(
            int sent) {

        this.sent = sent;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(
            int failed) {

        this.failed = failed;
    }

    public List<StudentInvitationResult> getResults() {
        return results;
    }

    public void setResults(
            List<StudentInvitationResult> results) {

        this.results = results;
    }


    // =====================================================
    // STUDENT INVITATION RESULT
    // =====================================================

    public static class StudentInvitationResult {

        private String name;

        private String email;

        private String status;

        private String message;

        public StudentInvitationResult() {
        }

        public StudentInvitationResult(
                String name,
                String email,
                String status,
                String message) {

            this.name = name;
            this.email = email;
            this.status = status;
            this.message = message;
        }

        public String getName() {
            return name;
        }

        public void setName(
                String name) {

            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(
                String email) {

            this.email = email;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(
                String status) {

            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(
                String message) {

            this.message = message;
        }
    }
}