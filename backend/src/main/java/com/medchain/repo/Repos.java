package com.medchain.repo;

import com.medchain.model.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public final class Repos {
    private Repos() {}

    public interface UserRepo extends JpaRepository<AppUser, Long> {
        Optional<AppUser> findByUsername(String username);
        boolean existsByUsername(String username);
        void deleteByRoleAndOrganizationId(Role role, Long organizationId);
    }

    public interface PharmacyRepo extends JpaRepository<Pharmacy, Long> {}

    public interface LabRepo extends JpaRepository<PathologyLab, Long> {}

    public interface PatientRepo extends JpaRepository<Patient, Long> {}

    // The filters are optional. They are built dynamically because PostgreSQL cannot infer the type of a
    // null bind parameter in "(:p is null or col = :p)" and fails with a 500.
    public interface BillRepo extends JpaRepository<Bill, String>, JpaSpecificationExecutor<Bill> {
        default List<Bill> search(Long patientId, LocalDate date, Long pharmacyId) {
            Specification<Bill> spec = Specification.where(null);
            if (patientId != null) spec = spec.and((b, q, cb) -> cb.equal(b.get("patient").get("id"), patientId));
            if (date != null) spec = spec.and((b, q, cb) -> cb.equal(b.get("billDate"), date));
            if (pharmacyId != null) spec = spec.and((b, q, cb) -> cb.equal(b.get("pharmacy").get("id"), pharmacyId));
            return findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        List<Bill> findByPatientId(Long patientId);
        long countByPharmacyId(Long pharmacyId);
        long countByPatientId(Long patientId);
    }

    public interface ReportRepo extends JpaRepository<LabReport, String>, JpaSpecificationExecutor<LabReport> {
        default List<LabReport> search(Long patientId, String type, Long labId) {
            Specification<LabReport> spec = Specification.where(null);
            if (patientId != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("patient").get("id"), patientId));
            if (type != null) spec = spec.and((r, q, cb) -> cb.equal(cb.lower(r.get("reportType")), type.toLowerCase()));
            if (labId != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("lab").get("id"), labId));
            return findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        long countByLabId(Long labId);
        long countByPatientId(Long patientId);
    }
}
