package com.adaptiveaitutor.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adaptiveaitutor.backend.entity.Subject;
import com.adaptiveaitutor.backend.repository.SubjectRepository;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(
            SubjectRepository subjectRepository) {

        this.subjectRepository =
                subjectRepository;
    }

    // =====================================================
    // GET ALL SUBJECTS
    // =====================================================

    public List<Subject> getAllSubjects() {

        return subjectRepository.findAll();
    }

    // =====================================================
    // GET SUBJECT BY ID
    // =====================================================

    public Optional<Subject> getSubjectById(
            Long id) {

        return subjectRepository.findById(id);
    }

    // =====================================================
    // CREATE SUBJECT
    // =====================================================

    public Subject createSubject(
            Subject subject) {

        return subjectRepository.save(
                subject
        );
    }

    // =====================================================
    // DELETE SUBJECT
    // =====================================================

    public boolean deleteSubject(
            Long id) {

        // -------------------------------------------------
        // CHECK WHETHER SUBJECT EXISTS
        // -------------------------------------------------

        if (!subjectRepository.existsById(id)) {

            return false;
        }

        // -------------------------------------------------
        // DELETE SUBJECT
        // -------------------------------------------------

        subjectRepository.deleteById(id);

        return true;
    }
}