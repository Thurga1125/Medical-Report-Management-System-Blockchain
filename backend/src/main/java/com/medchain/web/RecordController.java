package com.medchain.web;

import com.medchain.dto.Dtos.*;
import com.medchain.model.*;
import com.medchain.repo.Repos.*;
import com.medchain.service.CurrentUser;
import com.medchain.service.RecordService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Pharmacy bills and pathology lab reports, anchored on the blockchain. */
@RestController
@RequestMapping("/api")
public class RecordController {
    private final RecordService records;
    private final BillRepo bills;
    private final ReportRepo reports;
    private final CurrentUser current;

    public RecordController(RecordService records, BillRepo bills, ReportRepo reports, CurrentUser current) {
        this.records = records; this.bills = bills; this.reports = reports; this.current = current;
    }

    // ---- Bills
    @PostMapping("/bills")
    @PreAuthorize("hasRole('PHARMACY')")
    public Bill addBill(@Valid @RequestBody BillRequest req) {
        return records.createBill(req, current.get().organizationId);
    }

    @GetMapping("/bills")
    @PreAuthorize("hasAnyRole('HOSPITAL','PHARMACY')")
    public List<Bill> listBills(@RequestParam(required = false) Long patientId,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return records.searchBills(patientId, date, scopeFor(Role.PHARMACY));
    }

    @GetMapping("/bills/{id}/verify")
    @PreAuthorize("hasAnyRole('HOSPITAL','PHARMACY')")
    public VerifyResult verifyBill(@PathVariable String id) {
        Bill b = bills.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        AppUser u = current.get();
        if (u.role == Role.PHARMACY && !b.pharmacy.id.equals(u.organizationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return records.verifyBill(b);
    }

    // ---- Reports
    @PostMapping("/reports")
    @PreAuthorize("hasRole('LAB')")
    public LabReport addReport(@Valid @RequestBody ReportRequest req) {
        return records.createReport(req, current.get().organizationId);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('HOSPITAL','LAB')")
    public List<LabReport> listReports(@RequestParam(required = false) Long patientId,
                                       @RequestParam(required = false) String type) {
        return records.searchReports(patientId, type == null || type.isBlank() ? null : type, scopeFor(Role.LAB));
    }

    @GetMapping("/reports/{id}/verify")
    @PreAuthorize("hasAnyRole('HOSPITAL','LAB')")
    public VerifyResult verifyReport(@PathVariable String id) {
        LabReport r = reports.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        AppUser u = current.get();
        if (u.role == Role.LAB && !r.lab.id.equals(u.organizationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return records.verifyReport(r);
    }

    /** Organizations only see their own records; hospital admins see everything (null = no filter). */
    private Long scopeFor(Role orgRole) {
        AppUser u = current.get();
        return u.role == orgRole ? u.organizationId : null;
    }
}
