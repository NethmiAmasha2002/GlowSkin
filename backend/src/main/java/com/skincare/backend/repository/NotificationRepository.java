package com.skincare.backend.repository;

import com.skincare.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmailOrderByDateDesc(String email);
}