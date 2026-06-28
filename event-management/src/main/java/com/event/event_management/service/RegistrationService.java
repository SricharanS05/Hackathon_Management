package com.event.event_management.service;

import com.event.event_management.entity.Event;
import com.event.event_management.entity.Registration;
import com.event.event_management.repository.EventRepository;
import com.event.event_management.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EmailService emailService;




    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public Registration register(Registration registration) {

        eventRepository.findById(
                        registration.getEventId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Event not found"));
        Event event = eventRepository
                .findById(registration.getEventId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Event not found"));

        if (LocalDate.now().isAfter(
                event.getRegistrationDeadline())) {

            throw new RuntimeException(
                    "Registration deadline is over");
        }

        long registrationCount =
                registrationRepository
                        .countByEventId(
                                registration.getEventId());

        if (registrationCount >=
                event.getMaxCapacity()) {

            throw new RuntimeException(
                    "Event is full");
        }

        boolean alreadyExists =
                registrationRepository
                        .existsByStudentEmailAndEventId(
                                registration.getStudentEmail(),
                                registration.getEventId()
                        );

        if (alreadyExists) {
            throw new RuntimeException(
                    "Already registered for this event"
            );
        }

        Registration saved =
                registrationRepository.save(registration);

        emailService.sendEmail(
                registration.getStudentEmail(),
                "Event Registration Successful",
                "You have successfully registered for Event ID: "
                        + registration.getEventId()
        );

        return saved;
    }

    public void unregister(String email, Long eventId) {
        Registration registration = registrationRepository
                .findByStudentEmailAndEventId(email, eventId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        registrationRepository.delete(registration);
    }
}