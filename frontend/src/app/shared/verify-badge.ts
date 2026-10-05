import { Component, input } from '@angular/core';
import { VerifyResult } from '../core/models';

@Component({
  selector: 'app-verify-badge',
  template: `
    @if (result(); as r) {
      @switch (r.status) {
        @case ('VERIFIED') { <span class="badge badge-ok" [title]="r.message">✔ Verified</span> }
        @case ('TAMPERED') { <span class="badge badge-bad" [title]="r.message">✖ Tampered</span> }
        @default { <span class="badge badge-warn" [title]="r.message">⚠ Not anchored</span> }
      }
      @if (r.status === 'TAMPERED') {
        <div class="mono" style="margin-top:.4rem">on-chain: {{ r.onChainHash?.slice(0, 18) }}…<br />current: {{ r.currentHash.slice(0, 18) }}…</div>
      }
    }
  `,
})
export class VerifyBadge {
  result = input<VerifyResult | undefined>();
}
