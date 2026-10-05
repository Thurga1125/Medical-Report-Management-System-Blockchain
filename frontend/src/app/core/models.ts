export type Role = 'HOSPITAL' | 'PHARMACY' | 'LAB';

export interface Session { token: string; username: string; role: Role; organizationId: number | null; organizationName: string | null; }
export interface Org { id?: number; name: string; licenseNo?: string; address?: string; phone?: string; email?: string; username?: string; password?: string; }
export interface Patient { id?: number; name: string; dateOfBirth?: string | null; gender?: string; bloodGroup?: string; phone?: string; email?: string; address?: string; }
export interface BillItem { medicine: string; quantity: number; unitPrice: number; }
export interface Bill { id: string; patient: Patient; pharmacy: Org; billDate: string; total: number; items: BillItem[]; recordHash: string; txHash: string; blockNumber: number; }
export interface ReportValue { name: string; value: string; unit?: string; referenceRange?: string; }
export interface LabReport { id: string; patient: Patient; lab: Org; reportType: string; reportDate: string; values: ReportValue[]; recordHash: string; txHash: string; blockNumber: number; }
export interface VerifyResult { recordId: string; status: 'VERIFIED' | 'TAMPERED' | 'NOT_ANCHORED'; currentHash: string; onChainHash: string | null; txHash: string; blockNumber: number; message: string; }
export interface Stats { patients: number; pharmacies: number; labs: number; bills: number; reports: number; }
