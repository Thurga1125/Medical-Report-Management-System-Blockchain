package com.medchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
public class Bill {
    /** UUID, also used as the on-chain record id. */
    @Id
    public String id;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    public Patient patient;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    public Pharmacy pharmacy;
    public LocalDate billDate;
    @Column(precision = 12, scale = 2)
    public BigDecimal total;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id")
    @OrderBy("id ASC")
    public List<BillItem> items = new ArrayList<>();
    public String recordHash;
    public String txHash;
    public Long blockNumber;
    public Instant createdAt;
}
