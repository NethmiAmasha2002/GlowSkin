package com.skincare.backend.controller;

import com.skincare.backend.model.ContactMessage;
import com.skincare.backend.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://glowskin-frontend.s3-website-us-east-1.amazonaws.com"
})
public class ContactController {

    @Autowired
    private ContactMessageRepository messageRepo;

    @PostMapping
    public ContactMessage sendMessage(@RequestBody ContactMessage message) {
        message.setDate(LocalDateTime.now());
        message.setRead(false);
        message.setReplied(false);
        return messageRepo.save(message);
    }

    @GetMapping
    public List<ContactMessage> getAllMessages() {
        return messageRepo.findAllByOrderByDateDesc();
    }

    @GetMapping("/user")
    public List<ContactMessage> getMessagesForUser(@RequestParam String email) {
        return messageRepo.findByEmailOrderByDateDesc(email);
    }

    @PutMapping("/{id}/read")
    public ContactMessage markRead(@PathVariable Long id) {
        ContactMessage msg = messageRepo.findById(id).orElseThrow();
        msg.setRead(true);
        return messageRepo.save(msg);
    }

    @PutMapping("/{id}/reply")
    public ContactMessage reply(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        ContactMessage msg = messageRepo.findById(id).orElseThrow();
        msg.setReplied(true);
        msg.setReplyText(body.get("replyText"));
        return messageRepo.save(msg);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageRepo.deleteById(id);
    }
}