package com.medchain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "pathology_labs")
public class PathologyLab {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @NotBlank @Column(nullable = false)
    public String name;
    public String licenseNo;
    public String address;
    public String phone;
    public String email;
}
