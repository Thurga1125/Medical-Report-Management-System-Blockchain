package com.medchain.repo;

import com.medchain.model.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    public interface BillRepo extends JpaRepository<Bill, String> {
        @Query("select b from Bill b where (:patientId is null or b.patient.id = :patientId) "
             + "and (:date is null or b.billDate = :date) "
             + "and (:pharmacyId is null or b.pharmacy.id = :pharmacyId) order by b.createdAt desc")
        List<Bill> search(@Param("patientId") Long patientId, @Param("date") LocalDate date,
                          @Param("pharmacyId") Long pharmacyId);
        List<Bill> findByPatientId(Long patientId);
        long countByPatientId(Long patientId);
        long countByPharmacyId(Long pharmacyId);
    }

    public interface ReportRepo extends JpaRepository<LabReport, String> {
        @Query("select r from LabReport r where (:patientId is null or r.patient.id = :patientId) "
             + "and (:type is null or lower(r.reportType) = lower(:type)) "
             + "and (:labId is null or r.lab.id = :labId) order by r.createdAt desc")
        List<LabReport> search(@Param("patientId") Long patientId, @Param("type") String type,
                               @Param("labId") Long labId);
        long countByLabId(Long labId);
        long countByPatientId(Long patientId);
    }
}
