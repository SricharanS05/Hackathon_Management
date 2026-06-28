package com.event.event_management.config;

import com.event.event_management.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;
    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.addFilterBefore(
                rateLimitFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .requestMatchers("/dashboard/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers(HttpMethod.GET, "/events/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.PUT, "/events/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers(HttpMethod.DELETE, "/events/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers("/events/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers("/registrations/export/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers("/teams/**")
                        .permitAll()

                        .requestMatchers("/attendance/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers("/registrations/**")
                        .hasAnyRole("ADMIN", "ORGANIZER", "STUDENT")

                        .requestMatchers("/qr/**")
                        .hasAnyRole("ADMIN", "ORGANIZER", "STUDENT")

                        .requestMatchers("/qr-attendance/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")

                        .requestMatchers("/certificate/**")
                        .hasAnyRole("ADMIN", "ORGANIZER", "STUDENT")

                        .requestMatchers("/actuator/**").permitAll()

                        .anyRequest()
                        .authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

