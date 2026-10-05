package com.medchain.service;

import static org.junit.jupiter.api.Assertions.*;

import com.medchain.model.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class RecordHasherTest {
    private final RecordHasher hasher = new RecordHasher();

    static Bill bill() {
        Bill b = new Bill();
        b.id = "bill-1";
        b.patient = new Patient(); b.patient.id = 7L;
        b.pharmacy = new Pharmacy(); b.pharmacy.id = 3L;
        b.billDate = LocalDate.of(2026, 1, 15);
        b.total = new BigDecimal("25.00");
        BillItem i = new BillItem();
        i.medicine = "Paracetamol"; i.quantity = 2; i.unitPrice = new BigDecimal("12.50");
        b.items.add(i);
        return b;
    }

    static LabReport report() {
        LabReport r = new LabReport();
        r.id = "rep-1";
        r.patient = new Patient(); r.patient.id = 7L;
        r.lab = new PathologyLab(); r.lab.id = 4L;
        r.reportType = "Blood Test";
        r.reportDate = LocalDate.of(2026, 1, 15);
        ReportValue v = new ReportValue();
        v.name = "Hemoglobin"; v.value = "13.5"; v.unit = "g/dL"; v.referenceRange = "12-16";
        r.values.add(v);
        return r;
    }

    @Test
    void billHashIsA32ByteHexAndDeterministic() {
        String h = hasher.hash(bill());
        assertTrue(h.matches("0x[0-9a-f]{64}"), h);
        assertEquals(h, hasher.hash(bill()));
    }

    @Test
    void billHashChangesWhenAnyFieldChanges() {
        String original = hasher.hash(bill());
        Bill b = bill(); b.items.get(0).quantity = 20;
        assertNotEquals(original, hasher.hash(b), "quantity");
        b = bill(); b.items.get(0).unitPrice = new BigDecimal("12.51");
        assertNotEquals(original, hasher.hash(b), "unit price");
        b = bill(); b.items.get(0).medicine = "Ibuprofen";
        assertNotEquals(original, hasher.hash(b), "medicine");
        b = bill(); b.total = new BigDecimal("26.00");
        assertNotEquals(original, hasher.hash(b), "total");
        b = bill(); b.patient.id = 8L;
        assertNotEquals(original, hasher.hash(b), "patient");
        b = bill(); b.billDate = b.billDate.plusDays(1);
        assertNotEquals(original, hasher.hash(b), "date");
        b = bill(); b.items.add(b.items.get(0));
        assertNotEquals(original, hasher.hash(b), "extra item");
    }

    @Test
    void billHashIgnoresScaleAndSurroundingWhitespace() {
        // Values read back from PostgreSQL must hash the same as the ones hashed at creation time.
        Bill b = bill();
        b.total = new BigDecimal("25"); b.items.get(0).unitPrice = new BigDecimal("12.5000");
        b.items.get(0).medicine = "  Paracetamol ";
        assertEquals(hasher.hash(bill()), hasher.hash(b));
    }

    @Test
    void reportHashIsDeterministicAndDetectsEdits() {
        String original = hasher.hash(report());
        assertTrue(original.matches("0x[0-9a-f]{64}"));
        assertEquals(original, hasher.hash(report()));

        LabReport r = report(); r.values.get(0).value = "9.5";
        assertNotEquals(original, hasher.hash(r), "value");
        r = report(); r.reportType = "Urine Test";
        assertNotEquals(original, hasher.hash(r), "type");
        r = report(); r.values.get(0).referenceRange = "10-20";
        assertNotEquals(original, hasher.hash(r), "range");
    }

    @Test
    void billAndReportWithSameIdsNeverCollide() {
        Bill b = bill(); LabReport r = report();
        assertNotEquals(hasher.hash(b), hasher.hash(r));
    }
}
