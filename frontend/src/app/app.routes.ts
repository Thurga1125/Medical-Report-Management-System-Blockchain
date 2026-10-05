import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Shell } from './pages/shell';
import { Dashboard } from './pages/dashboard';
import { OrgManage } from './pages/org-manage';
import { Patients } from './pages/patients';
import { Bills } from './pages/bills';
import { NewBill } from './pages/new-bill';
import { Reports } from './pages/reports';
import { NewReport } from './pages/new-report';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'hospital', component: Shell, canActivate: [roleGuard('HOSPITAL')],
    children: [
      { path: '', component: Dashboard },
      { path: 'pharmacies', component: OrgManage, data: { kind: 'pharmacies' } },
      { path: 'labs', component: OrgManage, data: { kind: 'labs' } },
      { path: 'patients', component: Patients },
      { path: 'bills', component: Bills },
      { path: 'reports', component: Reports },
    ],
  },
  {
    path: 'pharmacy', component: Shell, canActivate: [roleGuard('PHARMACY')],
    children: [{ path: '', component: NewBill }, { path: 'bills', component: Bills }],
  },
  {
    path: 'lab', component: Shell, canActivate: [roleGuard('LAB')],
    children: [{ path: '', component: NewReport }, { path: 'reports', component: Reports }],
  },
  { path: '**', redirectTo: '' },
];
