package com.medchain.web;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.medchain.repo.Repos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class HospitalControllerTest {
    private BillRepo bills;
    private ReportRepo reports;
    private PatientRepo patients;
    private HospitalController controller;

    @BeforeEach
    void setUp() {
        bills = mock(BillRepo.class);
        reports = mock(ReportRepo.class);
        patients = mock(PatientRepo.class);
        controller = new HospitalController(mock(PharmacyRepo.class), mock(LabRepo.class), patients,
                mock(UserRepo.class), bills, reports, null);
    }

    @Test
    void patientWithBillsCannotBeDeleted() {
        when(bills.countByPatientId(1L)).thenReturn(2L);
        var e = assertThrows(ResponseStatusException.class, () -> controller.deletePatient(1L));
        assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
        verify(patients, never()).deleteById(any());
    }

    @Test
    void patientWithReportsCannotBeDeleted() {
        when(reports.countByPatientId(1L)).thenReturn(1L);
        assertThrows(ResponseStatusException.class, () -> controller.deletePatient(1L));
        verify(patients, never()).deleteById(any());
    }

    @Test
    void patientWithoutRecordsIsDeleted() {
        controller.deletePatient(1L);
        verify(patients).deleteById(1L);
    }
}
