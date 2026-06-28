package com.event.event_management.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 5;
    private static final long TIME_WINDOW = 60 * 1000; // 1 minute

    private final ConcurrentHashMap<String, RequestInfo> requestMap =
            new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Apply rate limiting only for login
        if (uri.equals("/auth/login") && !"OPTIONS".equalsIgnoreCase(request.getMethod())) {

            String clientIp = request.getRemoteAddr();

            RequestInfo info = requestMap.getOrDefault(
                    clientIp,
                    new RequestInfo(0, Instant.now().toEpochMilli())
            );

            long currentTime = Instant.now().toEpochMilli();

            // Reset counter after 1 minute
            if (currentTime - info.startTime > TIME_WINDOW) {
                info.count = 0;
                info.startTime = currentTime;
            }

            info.count++;

            requestMap.put(clientIp, info);

            if (info.count > MAX_REQUESTS) {

                response.setStatus(429);
                response.setContentType("application/json");

                response.getWriter().write("""
                {
                    "status":429,
                    "message":"Too Many Requests. Please try again after one minute."
                }
                """);

                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static class RequestInfo {

        int count;
        long startTime;

        RequestInfo(int count, long startTime) {
            this.count = count;
            this.startTime = startTime;
        }
    }
}