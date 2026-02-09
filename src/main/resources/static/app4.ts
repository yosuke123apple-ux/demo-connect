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
  private readonly useLocalMock: boolean;
  private readonly cooldownKey: string = 'rapid_cooldown_until';

  constructor() {
    const w = window as any;
    this.apiBase = (w && w.RAPID_API_BASE) ? String(w.RAPID_API_BASE).replace(/\/+$/, '') : '';
    this.useLocalMock = !this.apiBase;
    this.retryBtn = document.getElementById('retryBtn') as HTMLButtonElement | null;
    this.shareBtn = document.getElementById('shareBtn') as HTMLButtonElement | null;
    this.cooldownEl = document.getElementById('cooldownDisplay');
    this.init();
  }

  private init() {
    this.setupRetryButton();
    this.setupShareButton();
    this.restoreCooldown();
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

  private restoreCooldown() {
    const saved = Number(localStorage.getItem(this.cooldownKey));
    if (Number.isFinite(saved) && saved > Date.now()) {
      this.cooldownUntil = saved;
      this.startCooldown(saved);
    } else if (saved) {
      localStorage.removeItem(this.cooldownKey);
    }
  }

  private persistCooldown(until: number) {
    if (until > Date.now()) {
      localStorage.setItem(this.cooldownKey, String(until));
    } else {
      localStorage.removeItem(this.cooldownKey);
    }
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
    if (this.useLocalMock) {
      this.applyStatus(this.buildMockStatus());
      return;
    }
    try {
      const res = await fetch(`${this.apiBase}/api/rapid/status`);
      if (!res.ok) throw new Error('status not ok');
      const data = await res.json();
      this.applyStatus(data);
    } catch {
      this.applyStatus(this.buildMockStatus());
    }
  }

  private async reroll() {
    if (this.useLocalMock) {
      this.cooldownUntil = Date.now() + 5 * 60 * 1000;
      this.persistCooldown(this.cooldownUntil);
      this.startCooldown(this.cooldownUntil);
      this.applyStatus(this.buildMockStatus());
      return;
    }
    try {
      const res = await fetch(`${this.apiBase}/api/rapid/reroll`, { method: 'POST' });
      if (res.status === 429) {
        const until = Number(res.statusText);
        if (Number.isFinite(until)) {
          this.cooldownUntil = until;
          this.persistCooldown(until);
          this.startCooldown(until);
        }
        return;
      }
      if (!res.ok) throw new Error('reroll not ok');
      const data = await res.json();
      this.applyStatus(data);
    } catch {
      this.cooldownUntil = Date.now() + 5 * 60 * 1000;
      this.persistCooldown(this.cooldownUntil);
      this.startCooldown(this.cooldownUntil);
      this.applyStatus(this.buildMockStatus());
    }
  }

  private applyStatus(data: any) {
    const result = data.result;
    this.cooldownUntil = data.cooldownUntil || 0;
    this.persistCooldown(this.cooldownUntil);
    this.target = result.target;
    this.myId = result.myId;
    const rank = Number.isFinite(result.rank) ? result.rank : result.target;
    this.lastRank = rank;

    const targetEl = document.getElementById('targetDisplay');
    if (targetEl) targetEl.innerText = this.target.toLocaleString();

    this.renderTop3(result.top3 || []);
    this.renderNearby(result.nearby || []);
    this.renderHistory(data.history || []);
    this.animateRank(result.tier, rank);

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

  private animateRank(tierName?: string, rankValue?: number) {
    const el = document.getElementById('myRank')!;
    const tierEl = document.getElementById('tierDisplay')!;
    const duration = 2000;
    const start = performance.now();
    const finalRank = Number.isFinite(rankValue) ? (rankValue as number) : this.target;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); 
      const current = Math.floor(ease * finalRank);
      el.innerText = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (tierName) {
          tierEl.innerText = tierName;
          tierEl.classList.add('active');
        }
        this.lastRank = finalRank;
      }
    };
    requestAnimationFrame(step);
  }

  private buildMockStatus() {
    const target = Math.floor(Math.random() * 1_000_000) + 1;
    const tier = this.pickTier(target);
    const myId = this.genId();
    const rank = Math.max(1, Math.min(1_000_000, target + Math.floor((Math.random() - 0.5) * 5000)));
    const top3 = [
      { no: 1, rank: 12, id: this.genId() },
      { no: 2, rank: 248, id: this.genId() },
      { no: 3, rank: 5087, id: this.genId() }
    ];
    const nearby = [
      { id: this.genId(), rank: Math.max(1, Math.floor(target * 0.98)), isMe: false },
      { id: myId, rank, isMe: true },
      { id: this.genId(), rank: Math.floor(target * 1.02), isMe: false },
      { id: this.genId(), rank: Math.floor(target * 1.05), isMe: false }
    ];
    const history = [
      { time: Date.now() - 600000, rank: target, tier },
      { time: Date.now() - 3600000, rank: Math.floor(target * 1.03), tier: this.pickTier(Math.floor(target * 1.03)) }
    ];
    return {
      now: Date.now(),
      cooldownUntil: this.cooldownUntil,
      result: { target, rank, tier, myId, top3, nearby },
      history
    };
  }

  private pickTier(rank: number) {
    for (const t of TIERS) {
      if (rank <= t.max) return t.name;
    }
    return TIERS[TIERS.length - 1].name;
  }

  private genId() {
    const prefix = ["UNIT", "NODE", "USER", "CORE"];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix[Math.floor(Math.random() * prefix.length)]}_${num}`;
  }
}

new RapidMode();
