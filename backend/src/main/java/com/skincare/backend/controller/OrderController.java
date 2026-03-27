package com.skincare.backend.controller;

import com.skincare.backend.model.Order;
import com.skincare.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://glowskin-frontend.s3-website-us-east-1.amazonaws.com"
})
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @PostMapping("/place")
    public Order placeOrder(@RequestBody Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        return orderRepo.save(order);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAllByOrderByOrderDateDesc();
    }

    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id,
                              @RequestBody java.util.Map<String, String> body) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setStatus(body.get("status"));
        if (body.containsKey("adminNote")) {
            order.setAdminNote(body.get("adminNote"));
        }
        return orderRepo.save(order);
    }

    @PostMapping("/notify")
    public void notify(@RequestBody java.util.Map<String, String> body) {
        // Email notification placeholder
    }
}