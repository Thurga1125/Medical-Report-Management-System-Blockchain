package com.medchain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "report_values")
public class ReportValue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    @Column(name = "result_value")
    public String value;
    public String unit;
    public String referenceRange;
}
