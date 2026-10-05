package com.medchain.web;

import com.medchain.dto.Dtos.*;
import com.medchain.model.AppUser;
import com.medchain.model.Role;
import com.medchain.repo.Repos.*;
import com.medchain.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepo users;
    private final PharmacyRepo pharmacies;
    private final LabRepo labs;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepo users, PharmacyRepo pharmacies, LabRepo labs, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.pharmacies = pharmacies; this.labs = labs; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        AppUser u = users.findByUsername(req.username())
                .filter(x -> encoder.matches(req.password(), x.passwordHash))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        String orgName = switch (u.role) {
            case PHARMACY -> pharmacies.findById(u.organizationId).map(p -> p.name).orElse(null);
            case LAB -> labs.findById(u.organizationId).map(l -> l.name).orElse(null);
            case HOSPITAL -> "Hospital Administration";
        };
        return new LoginResponse(jwt.generate(u), u.username, u.role, u.organizationId, orgName);
    }
}
