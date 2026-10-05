package com.medchain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_reports")
public class LabReport {
    /** UUID, also used as the on-chain record id. */
    @Id
    public String id;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    public Patient patient;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    public PathologyLab lab;
    public String reportType;
    public LocalDate reportDate;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "report_id")
    @OrderBy("id ASC")
    public List<ReportValue> values = new ArrayList<>();
    public String recordHash;
    public String txHash;
    public Long blockNumber;
    public Instant createdAt;
}
