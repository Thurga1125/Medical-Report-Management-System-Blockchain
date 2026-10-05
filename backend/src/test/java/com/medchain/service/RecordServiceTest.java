package com.medchain.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.medchain.dto.Dtos.*;
import com.medchain.model.*;
import com.medchain.repo.Repos.*;
import com.medchain.service.BlockchainService.AnchorReceipt;
import com.medchain.service.BlockchainService.OnChainAnchor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RecordServiceTest {
    private final RecordHasher hasher = new RecordHasher();
    private BlockchainService chain;
    private BillRepo bills;
    private PatientRepo patients;
    private PharmacyRepo pharmacies;
    private RecordService service;

    @BeforeEach
    void setUp() {
        chain = mock(BlockchainService.class);
        bills = mock(BillRepo.class);
        patients = mock(PatientRepo.class);
        pharmacies = mock(PharmacyRepo.class);
        service = new RecordService(bills, mock(ReportRepo.class), patients, pharmacies, mock(LabRepo.class),
                hasher, chain);
        Patient p = new Patient(); p.id = 7L;
        Pharmacy ph = new Pharmacy(); ph.id = 3L;
        when(patients.findById(7L)).thenReturn(Optional.of(p));
        when(pharmacies.findById(3L)).thenReturn(Optional.of(ph));
        when(bills.save(any(Bill.class))).thenAnswer(inv -> inv.getArgument(0));
        when(chain.anchor(anyString(), anyString(), anyString())).thenReturn(new AnchorReceipt("0xtx", 12L));
    }

    private Bill createBill() {
        return service.createBill(new BillRequest(7L, null,
                List.of(new BillItemRequest("Paracetamol", 2, new BigDecimal("12.5")),
                        new BillItemRequest("Cough syrup", 1, new BigDecimal("30")))), 3L);
    }

    @Test
    void createBillComputesTotalAndAnchorsItsHash() {
        Bill b = createBill();
        assertEquals(new BigDecimal("55.00"), b.total);
        assertEquals(hasher.hash(b), b.recordHash);
        assertEquals("0xtx", b.txHash);
        assertEquals(12L, b.blockNumber);
        verify(chain).anchor(b.id, b.recordHash, "BILL");
    }

    @Test
    void billIsNotSavedWhenTheChainIsUnreachable() {
        when(chain.anchor(anyString(), anyString(), anyString()))
                .thenThrow(new IllegalStateException("Blockchain unavailable"));
        assertThrows(IllegalStateException.class, this::createBill);
        verify(bills, never()).save(any());
    }

    @Test
    void verifyReturnsVerifiedWhenChainHashMatches() {
        Bill b = createBill();
        when(chain.getAnchor(b.id)).thenReturn(new OnChainAnchor(true, b.recordHash, "BILL", "0xabc", 1L));
        assertEquals(VerifyStatus.VERIFIED, service.verifyBill(b).status());
    }

    @Test
    void verifyReturnsTamperedAfterTheBillIsEdited() {
        Bill b = createBill();
        when(chain.getAnchor(b.id)).thenReturn(new OnChainAnchor(true, b.recordHash, "BILL", "0xabc", 1L));
        b.items.get(0).quantity = 20; // what `update bill_items set quantity = 20` does in the demo
        VerifyResult result = service.verifyBill(b);
        assertEquals(VerifyStatus.TAMPERED, result.status());
        assertEquals(b.recordHash, result.onChainHash());
        assertNotEquals(result.onChainHash(), result.currentHash());
    }

    @Test
    void verifyReturnsNotAnchoredWhenChainHasNoRecord() {
        Bill b = createBill();
        when(chain.getAnchor(b.id)).thenReturn(new OnChainAnchor(false, "0x0", "", "0x0", 0L));
        assertEquals(VerifyStatus.NOT_ANCHORED, service.verifyBill(b).status());
    }
}
