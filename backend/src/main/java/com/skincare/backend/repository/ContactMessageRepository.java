
package com.skincare.backend.repository;

import com.skincare.backend.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findByEmailOrderByDateDesc(String email);
}
