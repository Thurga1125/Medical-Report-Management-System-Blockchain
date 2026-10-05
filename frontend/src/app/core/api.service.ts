import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Bill, LabReport, Org, Patient, Stats, VerifyResult } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  stats() { return this.http.get<Stats>(`${this.base}/stats`); }

  // organizations: 'pharmacies' | 'labs'
  orgs(kind: string) { return this.http.get<Org[]>(`${this.base}/${kind}`); }
  saveOrg(kind: string, o: Org) {
    return o.id ? this.http.put<Org>(`${this.base}/${kind}/${o.id}`, o) : this.http.post<Org>(`${this.base}/${kind}`, o);
  }
  deleteOrg(kind: string, id: number) { return this.http.delete<void>(`${this.base}/${kind}/${id}`); }

  patients() { return this.http.get<Patient[]>(`${this.base}/patients`); }
  savePatient(p: Patient) {
    return p.id ? this.http.put<Patient>(`${this.base}/patients/${p.id}`, p) : this.http.post<Patient>(`${this.base}/patients`, p);
  }
  deletePatient(id: number) { return this.http.delete<void>(`${this.base}/patients/${id}`); }

  bills(patientId?: number | null, date?: string) {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (date) params = params.set('date', date);
    return this.http.get<Bill[]>(`${this.base}/bills`, { params });
  }
  addBill(body: unknown) { return this.http.post<Bill>(`${this.base}/bills`, body); }
  verifyBill(id: string) { return this.http.get<VerifyResult>(`${this.base}/bills/${id}/verify`); }

  reports(patientId?: number | null, type?: string) {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId);
    if (type) params = params.set('type', type);
    return this.http.get<LabReport[]>(`${this.base}/reports`, { params });
  }
  addReport(body: unknown) { return this.http.post<LabReport>(`${this.base}/reports`, body); }
  verifyReport(id: string) { return this.http.get<VerifyResult>(`${this.base}/reports/${id}/verify`); }
}
