package com.medchain.service;

import com.medchain.model.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.web3j.utils.Numeric;

/** Builds a canonical string for each record and fingerprints it with SHA-256. */
@Component
public class RecordHasher {

    public String hash(Bill b) {
        String items = b.items.stream()
                .map(i -> clean(i.medicine) + ":" + i.quantity + ":" + money(i.unitPrice))
                .collect(Collectors.joining(","));
        return sha256("BILL|" + b.id + "|" + b.patient.id + "|" + b.pharmacy.id + "|" + b.billDate + "|"
                + money(b.total) + "|" + items);
    }

    public String hash(LabReport r) {
        String values = r.values.stream()
                .map(v -> clean(v.name) + ":" + clean(v.value) + ":" + clean(v.unit) + ":" + clean(v.referenceRange))
                .collect(Collectors.joining(","));
        return sha256("REPORT|" + r.id + "|" + r.patient.id + "|" + r.lab.id + "|" + clean(r.reportType) + "|"
                + r.reportDate + "|" + values);
    }

    private static String money(BigDecimal v) {
        return v == null ? "0.00" : v.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String clean(String s) {
        return StringUtils.hasText(s) ? s.trim() : "";
    }

    private static String sha256(String s) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
            return Numeric.toHexString(digest);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
