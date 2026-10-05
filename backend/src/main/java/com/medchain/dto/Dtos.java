package com.medchain.dto;

import com.medchain.model.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(String token, String username, Role role, Long organizationId, String organizationName) {}

    /** Create/update an organization (pharmacy or lab); username/password create its login on creation. */
    public record OrgRequest(@NotBlank String name, String licenseNo, String address, String phone, String email,
                             String username, String password) {}

    public record BillItemRequest(@NotBlank String medicine, @Min(1) int quantity,
                                  @NotNull @DecimalMin("0.00") BigDecimal unitPrice) {}

    public record BillRequest(@NotNull Long patientId, LocalDate billDate,
                              @NotEmpty List<@Valid BillItemRequest> items) {}

    public record ReportValueRequest(@NotBlank String name, @NotBlank String value, String unit, String referenceRange) {}

    public record ReportRequest(@NotNull Long patientId, @NotBlank String reportType, LocalDate reportDate,
                                @NotEmpty List<@Valid ReportValueRequest> values) {}

    public enum VerifyStatus { VERIFIED, TAMPERED, NOT_ANCHORED }

    public record VerifyResult(String recordId, VerifyStatus status, String currentHash, String onChainHash,
                               String txHash, Long blockNumber, String message) {}

    public record Stats(long patients, long pharmacies, long labs, long bills, long reports) {}
}
