package com.medchain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(unique = true, nullable = false)
    public String username;
    @JsonIgnore
    @Column(nullable = false)
    public String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    public Role role;
    /** Pharmacy id or lab id this login belongs to (null for hospital admins). */
    public Long organizationId;
}
