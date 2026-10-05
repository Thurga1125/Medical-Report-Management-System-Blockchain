package com.medchain.service;

import com.medchain.dto.Dtos.*;
import com.medchain.model.*;
import com.medchain.repo.Repos.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Creates bills/reports, anchors their fingerprint on the blockchain and verifies them later. */
@Service
public class RecordService {
    private final BillRepo bills;
    private final ReportRepo reports;
    private final PatientRepo patients;
    private final PharmacyRepo pharmacies;
    private final LabRepo labs;
    private final RecordHasher hasher;
    private final BlockchainService chain;

    public RecordService(BillRepo bills, ReportRepo reports, PatientRepo patients, PharmacyRepo pharmacies,
                         LabRepo labs, RecordHasher hasher, BlockchainService chain) {
        this.bills = bills; this.reports = reports; this.patients = patients;
        this.pharmacies = pharmacies; this.labs = labs; this.hasher = hasher; this.chain = chain;
    }

    public Bill createBill(BillRequest req, Long pharmacyId) {
        Bill b = new Bill();
        b.id = UUID.randomUUID().toString();
        b.patient = patients.findById(req.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown patient"));
        b.pharmacy = pharmacies.findById(pharmacyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown pharmacy"));
        b.billDate = req.billDate() != null ? req.billDate() : LocalDate.now();
        BigDecimal total = BigDecimal.ZERO;
        for (BillItemRequest r : req.items()) {
            BillItem i = new BillItem();
            i.medicine = r.medicine().trim();
            i.quantity = r.quantity();
            i.unitPrice = r.unitPrice().setScale(2, java.math.RoundingMode.HALF_UP);
            b.items.add(i);
            total = total.add(i.unitPrice.multiply(BigDecimal.valueOf(i.quantity)));
        }
        b.total = total.setScale(2, java.math.RoundingMode.HALF_UP);
        b.createdAt = Instant.now();
        b.recordHash = hasher.hash(b);
        // Anchor first: if the chain is unreachable nothing is stored.
        var receipt = chain.anchor(b.id, b.recordHash, "BILL");
        b.txHash = receipt.txHash();
        b.blockNumber = receipt.blockNumber();
        return bills.save(b);
    }

    public LabReport createReport(ReportRequest req, Long labId) {
        LabReport r = new LabReport();
        r.id = UUID.randomUUID().toString();
        r.patient = patients.findById(req.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown patient"));
        r.lab = labs.findById(labId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown lab"));
        r.reportType = req.reportType().trim();
        r.reportDate = req.reportDate() != null ? req.reportDate() : LocalDate.now();
        for (ReportValueRequest v : req.values()) {
            ReportValue rv = new ReportValue();
            rv.name = v.name().trim();
            rv.value = v.value().trim();
            rv.unit = v.unit();
            rv.referenceRange = v.referenceRange();
            r.values.add(rv);
        }
        r.createdAt = Instant.now();
        r.recordHash = hasher.hash(r);
        var receipt = chain.anchor(r.id, r.recordHash, "REPORT");
        r.txHash = receipt.txHash();
        r.blockNumber = receipt.blockNumber();
        return reports.save(r);
    }

    public VerifyResult verifyBill(Bill b) {
        return verify(b.id, hasher.hash(b), b.txHash, b.blockNumber);
    }

    public VerifyResult verifyReport(LabReport r) {
        return verify(r.id, hasher.hash(r), r.txHash, r.blockNumber);
    }

    private VerifyResult verify(String id, String currentHash, String txHash, Long block) {
        var anchor = chain.getAnchor(id);
        if (!anchor.exists()) {
            return new VerifyResult(id, VerifyStatus.NOT_ANCHORED, currentHash, null, txHash, block,
                    "No fingerprint for this record exists on the blockchain.");
        }
        boolean ok = anchor.hash().equalsIgnoreCase(currentHash);
        return new VerifyResult(id, ok ? VerifyStatus.VERIFIED : VerifyStatus.TAMPERED, currentHash, anchor.hash(),
                txHash, block, ok ? "Record matches the fingerprint stored on the blockchain."
                        : "Record data does not match the blockchain fingerprint - it has been altered.");
    }

    public List<Bill> searchBills(Long patientId, LocalDate date, Long pharmacyId) {
        return bills.search(patientId, date, pharmacyId);
    }

    public List<LabReport> searchReports(Long patientId, String type, Long labId) {
        return reports.search(patientId, type, labId);
    }
}
