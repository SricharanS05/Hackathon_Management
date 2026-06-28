package com.event.event_management.repository;

import com.event.event_management.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationRepository
        extends JpaRepository<Registration, Long> {
    boolean existsByStudentEmailAndEventId(
            String studentEmail,
            Long eventId
    );
    Optional<Registration> findByStudentEmailAndEventId(
            String studentEmail,
            Long eventId
    );

    Optional<Registration> findByStudentNameAndStudentEmail(
            String studentName,
            String studentEmail
    );

    long countByEventId(Long eventId);
}