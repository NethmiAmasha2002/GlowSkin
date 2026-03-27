package com.skincare.backend.controller;

import com.skincare.backend.model.Notification;
import com.skincare.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://glowskin-frontend.s3-website-us-east-1.amazonaws.com"
})
public class NotificationController {

    @Autowired
    private NotificationRepository notifRepo;

    @GetMapping
    public List<Notification> getNotifications(@RequestParam String email) {
        return notifRepo.findByEmailOrderByDateDesc(email);
    }

    @PostMapping
    public Notification addNotification(@RequestBody Notification notif) {
        notif.setDate(LocalDateTime.now());
        notif.setRead(false);
        return notifRepo.save(notif);
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id) {
        Notification n = notifRepo.findById(id).orElseThrow();
        n.setRead(true);
        return notifRepo.save(n);
    }
}