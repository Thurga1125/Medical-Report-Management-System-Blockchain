package com.medchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bill_items")
public class BillItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String medicine;
    public int quantity;
    public BigDecimal unitPrice;
}
