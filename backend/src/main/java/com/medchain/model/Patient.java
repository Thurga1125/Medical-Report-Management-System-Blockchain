package com.medchain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @NotBlank @Column(nullable = false)
    public String name;
    public LocalDate dateOfBirth;
    public String gender;
    public String bloodGroup;
    public String phone;
    public String email;
    public String address;
}
