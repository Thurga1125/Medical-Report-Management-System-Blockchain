package com.medchain.web;

import com.medchain.dto.Dtos.*;
import com.medchain.model.*;
import com.medchain.repo.Repos.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Hospital administrator: manage pharmacies, pathology labs and patients. */
@RestController
@RequestMapping("/api")
public class HospitalController {
    private final PharmacyRepo pharmacies;
    private final LabRepo labs;
    private final PatientRepo patients;
    private final UserRepo users;
    private final BillRepo bills;
    private final ReportRepo reports;
    private final PasswordEncoder encoder;

    public HospitalController(PharmacyRepo pharmacies, LabRepo labs, PatientRepo patients, UserRepo users,
                              BillRepo bills, ReportRepo reports, PasswordEncoder encoder) {
        this.pharmacies = pharmacies; this.labs = labs; this.patients = patients; this.users = users;
        this.bills = bills; this.reports = reports; this.encoder = encoder;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('HOSPITAL')")
    public Stats stats() {
        return new Stats(patients.count(), pharmacies.count(), labs.count(), bills.count(), reports.count());
    }

    // ---- Pharmacies
    @GetMapping("/pharmacies")
    @PreAuthorize("hasRole('HOSPITAL')")
    public List<Pharmacy> listPharmacies() { return pharmacies.findAll(); }

    @PostMapping("/pharmacies")
    @PreAuthorize("hasRole('HOSPITAL')")
    @Transactional
    public Pharmacy addPharmacy(@Valid @RequestBody OrgRequest r) {
        Pharmacy p = new Pharmacy();
        copy(r, p);
        p = pharmacies.save(p);
        createLogin(r, Role.PHARMACY, p.id);
        return p;
    }

    @PutMapping("/pharmacies/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public Pharmacy updatePharmacy(@PathVariable Long id, @Valid @RequestBody OrgRequest r) {
        Pharmacy p = pharmacies.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        copy(r, p);
        return pharmacies.save(p);
    }

    @DeleteMapping("/pharmacies/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    @Transactional
    public void deletePharmacy(@PathVariable Long id) {
        if (bills.countByPharmacyId(id) > 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Pharmacy has bills on record and cannot be deleted.");
        users.deleteByRoleAndOrganizationId(Role.PHARMACY, id);
        pharmacies.deleteById(id);
    }

    // ---- Labs
    @GetMapping("/labs")
    @PreAuthorize("hasRole('HOSPITAL')")
    public List<PathologyLab> listLabs() { return labs.findAll(); }

    @PostMapping("/labs")
    @PreAuthorize("hasRole('HOSPITAL')")
    @Transactional
    public PathologyLab addLab(@Valid @RequestBody OrgRequest r) {
        PathologyLab l = new PathologyLab();
        copy(r, l);
        l = labs.save(l);
        createLogin(r, Role.LAB, l.id);
        return l;
    }

    @PutMapping("/labs/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public PathologyLab updateLab(@PathVariable Long id, @Valid @RequestBody OrgRequest r) {
        PathologyLab l = labs.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        copy(r, l);
        return labs.save(l);
    }

    @DeleteMapping("/labs/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    @Transactional
    public void deleteLab(@PathVariable Long id) {
        if (reports.countByLabId(id) > 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Lab has reports on record and cannot be deleted.");
        users.deleteByRoleAndOrganizationId(Role.LAB, id);
        labs.deleteById(id);
    }

    // ---- Patients (readable by every role so pharmacies/labs can pick a patient)
    @GetMapping("/patients")
    public List<Patient> listPatients() { return patients.findAll(); }

    @PostMapping("/patients")
    @PreAuthorize("hasRole('HOSPITAL')")
    public Patient addPatient(@Valid @RequestBody Patient p) {
        p.id = null;
        return patients.save(p);
    }

    @PutMapping("/patients/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public Patient updatePatient(@PathVariable Long id, @Valid @RequestBody Patient p) {
        if (!patients.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        p.id = id;
        return patients.save(p);
    }

    @DeleteMapping("/patients/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public void deletePatient(@PathVariable Long id) {
        if (bills.countByPatientId(id) > 0 || reports.countByPatientId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Patient has bills or reports on record and cannot be deleted.");
        }
        patients.deleteById(id);
    }

    private void createLogin(OrgRequest r, Role role, Long orgId) {
        if (r.username() == null || r.username().isBlank() || r.password() == null || r.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and a password of 6+ characters are required");
        }
        if (users.existsByUsername(r.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        AppUser u = new AppUser();
        u.username = r.username().trim();
        u.passwordHash = encoder.encode(r.password());
        u.role = role;
        u.organizationId = orgId;
        users.save(u);
    }

    private static void copy(OrgRequest r, Pharmacy p) {
        p.name = r.name(); p.licenseNo = r.licenseNo(); p.address = r.address(); p.phone = r.phone(); p.email = r.email();
    }

    private static void copy(OrgRequest r, PathologyLab p) {
        p.name = r.name(); p.licenseNo = r.licenseNo(); p.address = r.address(); p.phone = r.phone(); p.email = r.email();
    }
}
