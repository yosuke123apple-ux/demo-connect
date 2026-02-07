// ランク定義
const TIERS = [
  { name: "CORE LEGEND", max: 100 },
  { name: "HIGH OPERATOR", max: 10000 },
  { name: "COMMONER", max: 1000000 }
];

class RapidMode {
  private target: number = 0;
  private myId: string = '';
  private retryBtn: HTMLButtonElement | null;
  private shareBtn: HTMLButtonElement | null;
  private cooldownEl: HTMLElement | null;
  private cooldownTimer: number | null = null;
  private lastRank: number = 0;
  private cooldownUntil: number = 0;
  private readonly apiBase: string;

  constructor() {
    const w = window as any;
    this.apiBase = (w && w.RAPID_API_BASE) ? String(w.RAPID_API_BASE).replace(/\/+$/, '') : '';
    this.retryBtn = document.getElementById('retryBtn') as HTMLButtonElement | null;
    this.shareBtn = document.getElementById('shareBtn') as HTMLButtonElement | null;
    this.cooldownEl = document.getElementById('cooldownDisplay');
    this.init();
  }

  private init() {
    this.setupRetryButton();
    this.setupShareButton();
    this.loadStatus();
  }

  private setupRetryButton() {
    if (!this.retryBtn) return;
    const handleClick = async () => {
      if (Date.now() < this.cooldownUntil) return;
      await this.reroll();
    };
    this.retryBtn.addEventListener('click', handleClick);
    this.setRetryLabel();
  }

  private setRetryLabel(remainingMs?: number) {
    if (!this.retryBtn) return;
    if (!remainingMs || remainingMs <= 0) {
      this.retryBtn.innerText = '再解析を試行する';
      if (this.cooldownEl) this.cooldownEl.innerText = '再解析可能';
      return;
    }
    const totalSec = Math.ceil(remainingMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const mm = String(min).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    this.retryBtn.innerText = `再解析まで ${mm}:${ss}`;
    if (this.cooldownEl) this.cooldownEl.innerText = `再解析まで ${mm}:${ss}`;
  }

  private startCooldown(until: number) {
    if (!this.retryBtn) return;
    this.retryBtn.disabled = true;
    if (this.cooldownTimer) {
      window.clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
    const tick = () => {
      const remaining = until - Date.now();
      if (remaining <= 0) {
        if (this.cooldownTimer) {
          window.clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
        }
        this.retryBtn!.disabled = false;
        this.setRetryLabel();
        return;
      }
      this.setRetryLabel(remaining);
    };
    tick();
    this.cooldownTimer = window.setInterval(tick, 1000);
  }

  private setupShareButton() {
    if (!this.shareBtn) return;
    this.shareBtn.addEventListener('click', () => {
      const tierEl = document.getElementById('tierDisplay');
      const tierName = tierEl?.innerText || 'ANALYZING...';
      const rank = this.lastRank || this.target;
      const text =
`【MILLION CORE | RAPID】
抽選番号: ${this.target.toLocaleString()}
確定順位: ${rank.toLocaleString()}位
称号: ${tierName}`;

      if (navigator.share) {
        navigator.share({ text }).catch(() => undefined);
        return;
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        this.shareBtn!.innerText = 'コピーしました';
        window.setTimeout(() => {
          if (this.shareBtn) this.shareBtn.innerText = '結果を共有する';
        }, 2000);
      }
    });
  }

  private async loadStatus() {
    const res = await fetch(`${this.apiBase}/api/rapid/status`);
    if (!res.ok) return;
    const data = await res.json();
    this.applyStatus(data);
  }

  private async reroll() {
    const res = await fetch(`${this.apiBase}/api/rapid/reroll`, { method: 'POST' });
    if (res.status === 429) {
      const until = Number(res.statusText);
      if (Number.isFinite(until)) {
        this.cooldownUntil = until;
        this.startCooldown(until);
      }
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    this.applyStatus(data);
  }

  private applyStatus(data: any) {
    const result = data.result;
    this.cooldownUntil = data.cooldownUntil || 0;
    this.target = result.target;
    this.myId = result.myId;

    const targetEl = document.getElementById('targetDisplay');
    if (targetEl) targetEl.innerText = this.target.toLocaleString();

    this.renderTop3(result.top3 || []);
    this.renderNearby(result.nearby || []);
    this.renderHistory(data.history || []);
    this.animateRank(result.tier);

    if (Date.now() < this.cooldownUntil) {
      this.startCooldown(this.cooldownUntil);
    } else if (this.retryBtn) {
      this.retryBtn.disabled = false;
    }
  }

  private renderTop3(list: Array<{ no: number; rank: number; id: string }>) {
    const container = document.getElementById('top3Container')!;
    const html = list.map((p) => `
      <div class="rank-item ${p.no === 1 ? 'tier-1' : ''}">
        <div class="r-info">
          <span class="r-no">NO.0${p.no}</span>
          <span class="r-name">${p.id}</span>
        </div>
        <span class="r-val">${p.rank.toLocaleString()}位</span>
      </div>
    `).join('');
    container.innerHTML = html;
  }

  private renderNearby(players: Array<{ id: string; rank: number; isMe?: boolean }>) {
    const container = document.getElementById('nearbyContainer')!;
    const sorted = [...players].sort((a, b) => a.rank - b.rank);
    container.innerHTML = sorted.map(p => `
      <div class="rank-item ${p.isMe ? 'is-me' : 'is-others'}">
        <div class="r-info">
          <span class="r-no">${p.isMe ? '>>' : 'ID'}</span>
          <span class="r-name">${p.id}</span>
        </div>
        <div class="r-val">${p.rank.toLocaleString()}位</div>
      </div>
    `).join('');
    container.classList.add('fade-in');
  }

  private renderHistory(list: Array<{ time: number; rank: number; tier: string }>) {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    if (!list || list.length === 0) {
      container.innerHTML = `<div class="rank-item"><span class="r-no">--</span><span class="r-val">履歴なし</span></div>`;
      return;
    }
    container.innerHTML = list.map((h) => `
      <div class="rank-item">
        <div class="r-info">
          <span class="r-no">${new Date(h.time).toLocaleTimeString().slice(0,5)}</span>
          <span class="r-name">${h.tier}</span>
        </div>
        <span class="r-val">${h.rank.toLocaleString()}位</span>
      </div>
    `).join('');
  }

  private animateRank(tierName?: string) {
    const el = document.getElementById('myRank')!;
    const tierEl = document.getElementById('tierDisplay')!;
    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); 
      const current = Math.floor(ease * this.target);
      el.innerText = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (tierName) {
          tierEl.innerText = tierName;
          tierEl.classList.add('active');
        }
        this.lastRank = this.target;
      }
    };
    requestAnimationFrame(step);
  }
}

new RapidMode();
