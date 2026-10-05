package com.medchain.config;

import com.medchain.model.AppUser;
import com.medchain.model.Role;
import com.medchain.repo.Repos.UserRepo;
import java.security.SecureRandom;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedAdmin(UserRepo users, PasswordEncoder encoder,
                                @Value("${app.seed.admin-username}") String username,
                                @Value("${app.seed.admin-password}") String password) {
        return args -> {
            if (!users.existsByUsername(username)) {
                String pw = password;
                if (pw == null || pw.isBlank()) {
                    byte[] raw = new byte[12];
                    new SecureRandom().nextBytes(raw);
                    pw = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
                    log.warn("Created hospital admin '{}' with generated password: {}", username, pw);
                }
                AppUser admin = new AppUser();
                admin.username = username;
                admin.passwordHash = encoder.encode(pw);
                admin.role = Role.HOSPITAL;
                users.save(admin);
            }
        };
    }
}
