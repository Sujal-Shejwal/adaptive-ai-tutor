package com.adaptiveaitutor.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkInvitationUploadResponse {

    private int total;
    private List<BulkInvitationStudent> students = new ArrayList<>();

    public BulkInvitationUploadResponse() {
    }

    public BulkInvitationUploadResponse(
            int total,
            List<BulkInvitationStudent> students
    ) {
        this.total = total;
        this.students = students;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<BulkInvitationStudent> getStudents() {
        return students;
    }

    public void setStudents(List<BulkInvitationStudent> students) {
        this.students = students;
    }
}