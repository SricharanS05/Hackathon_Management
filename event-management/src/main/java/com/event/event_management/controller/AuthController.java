package com.event.event_management.controller;

import com.event.event_management.dto.RegisterRequest;
import com.event.event_management.entity.User;
import com.event.event_management.security.JwtUtil;
import com.event.event_management.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.event.event_management.dto.LoginRequest;

@Tag(name = "Authentication APIs")
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userService.login(request);

        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );
    }

}