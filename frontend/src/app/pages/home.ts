import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Medical Records <span class="hl">Secured by Blockchain</span></h1>
          <p>Hospitals, pharmacies and pathology labs share bills and lab reports through one system - every
             record is fingerprinted on an Ethereum network so any tampering is detected instantly.</p>
          <div class="hero-buttons">
            <button class="btn-primary" (click)="go()">Sign In</button>
          </div>
        </div>
        <div class="hero-image"><img src="/images/hero.webp" alt="Doctor" /></div>
      </div>
    </section>

    <section class="features">
      <h2>Why MedChain?</h2>
      <p class="sub">Accessibility for caretakers and doctors, without giving up security</p>
      <div class="grid">
        @for (f of features; track f.title) {
          <div class="feature"><div class="icon">{{ f.icon }}</div><h3>{{ f.title }}</h3><p>{{ f.text }}</p></div>
        }
      </div>
    </section>

    <section class="how">
      <h2>How It Works</h2>
      <div class="steps">
        @for (s of steps; track s.n) {
          <div class="step"><div class="num">{{ s.n }}</div><h3>{{ s.title }}</h3><p>{{ s.text }}</p></div>
        }
      </div>
    </section>

    <section class="cta">
      <h2>Ready to get started?</h2>
      <p>Sign in with the account issued by your hospital administrator</p>
      <button class="btn-cta" (click)="go()">Go to Login</button>
    </section>
  `,
  styles: `
    .hero { background: linear-gradient(135deg, #E8F4F8, #E8F4F8); padding: 4rem 2rem; }
    .hero-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
    h1 { font-size: 3rem; color: #1a1a1a; line-height: 1.2; }
    .hl { color: var(--primary); }
    .hero-text p { font-size: 1.15rem; color: var(--text); margin: 1.5rem 0 2rem; }
    .hero-image img { width: 100%; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,.15); }
    .features, .how { padding: 4rem 2rem; text-align: center; max-width: 1200px; margin: 0 auto; }
    h2 { font-size: 2.2rem; }
    .sub { color: var(--muted); font-size: 1.1rem; margin: .5rem 0 2.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
    .feature { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.07); }
    .icon { width: 70px; height: 70px; margin: 0 auto 1rem; border-radius: 50%; display: grid; place-items: center; font-size: 2rem; background: linear-gradient(135deg, #E3F2FD, #BBDEFB); }
    .feature p, .step p { color: var(--muted); margin-top: .5rem; }
    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; margin-top: 2.5rem; }
    .num { width: 64px; height: 64px; margin: 0 auto 1rem; border-radius: 50%; display: grid; place-items: center; font-size: 1.5rem; font-weight: 700; color: #fff; background: linear-gradient(135deg, #4FC3F7, #29B6F6); }
    .cta { background: linear-gradient(135deg, #4A90E2, #29B6F6); color: #fff; text-align: center; padding: 4rem 2rem; }
    .cta p { font-size: 1.2rem; margin: 1rem 0 2rem; }
    .btn-cta { background: #fff; color: var(--primary); border: none; padding: 1rem 2.5rem; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; }
    @media (max-width: 800px) { .hero-content { grid-template-columns: 1fr; } h1 { font-size: 2.2rem; } }
  `,
})
export class Home {
  private router = inject(Router);
  features = [
    { icon: '🔗', title: 'Tamper-proof', text: 'Every bill and report is hashed and anchored on the blockchain' },
    { icon: '🛡️', title: 'Role-based access', text: 'Hospital, pharmacy and lab staff only see what they need' },
    { icon: '🔍', title: 'Fabrication check', text: 'Verify any record against its on-chain fingerprint in one click' },
    { icon: '📋', title: 'Complete history', text: 'Up-to-date records support accurate diagnosis decisions' },
  ];
  steps = [
    { n: '01', title: 'Record', text: 'Pharmacies add bills and labs add reports for a patient' },
    { n: '02', title: 'Anchor', text: 'A SHA-256 fingerprint is written to the Ethereum network' },
    { n: '03', title: 'Verify', text: 'The hospital checks any record for tampering at any time' },
  ];
  go() { this.router.navigate(['/login']); }
}
