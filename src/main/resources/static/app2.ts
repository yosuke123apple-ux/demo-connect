/**
 * デジタル数字予想ゲーム - 保存機能付き
 */

const STORAGE_KEY = 'user_prediction_data';
const STORAGE_TIME_KEY = 'user_prediction_time';

const getResultAt = (baseTime?: number): Date => {
  const now = baseTime ? new Date(baseTime) : new Date();
  const target = new Date(now);
  target.setDate(now.getDate() + 1);
  target.setHours(0, 0, 0, 0);
  return target;
};

const maybeRedirectToResult = (): void => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  const savedTime = localStorage.getItem(STORAGE_TIME_KEY);
  if (!savedData || !savedTime) return;

  const resultAt = getResultAt(Number(savedTime)).getTime();
  if (Date.now() >= resultAt) {
    window.location.href = 'index3.html';
  }
};

// 1. カウントダウンタイマー
const startCountdown = (): void => {
  const update = (): void => {
    const now: Date = new Date();
    const savedTime = localStorage.getItem(STORAGE_TIME_KEY);
    const target: Date = savedTime ? getResultAt(Number(savedTime)) : getResultAt();
    const diff: number = target.getTime() - now.getTime();
    if (diff <= 0) {
      maybeRedirectToResult();
      return;
    }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const hEl = document.getElementById('hours-val');
    const mEl = document.getElementById('minutes-val');
    const sEl = document.getElementById('seconds-val');

    if (hEl && mEl && sEl) {
      hEl.textContent = h.toString().padStart(2, '0');
      mEl.textContent = m.toString().padStart(2, '0');
      sEl.textContent = s.toString().padStart(2, '0');
    }
  };
  setInterval(update, 1000);
  update();
};

// 2. フォーム制御（保存と復元）
const setupPredictionForm = (): void => {
  const inputEl = document.getElementById('user-predict') as HTMLInputElement | null;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const inputView = document.getElementById('input-view') as HTMLElement | null;
  const confirmedView = document.getElementById('confirmed-view') as HTMLElement | null;
  const displayNum = document.getElementById('display-number') as HTMLElement | null;

  if (!inputEl || !submitBtn || !inputView || !confirmedView || !displayNum) return;

  // --- 【追加】保存されたデータがあるかチェック ---
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    displayNum.textContent = parseInt(savedData).toLocaleString();
    inputView.style.display = 'none';
    confirmedView.style.display = 'block';
  }

  submitBtn.addEventListener('click', () => {
    const val = inputEl.value;
    const num = parseInt(val, 10);

    if (isNaN(num) || num < 1 || num > 1000000) {
      alert("1 から 1,000,000 の数字を入力してください");
      return;
    }

    // --- 【追加】LocalStorageに保存 ---
    localStorage.setItem(STORAGE_KEY, num.toString());
    localStorage.setItem(STORAGE_TIME_KEY, String(Date.now()));

    displayNum.textContent = num.toLocaleString();
    inputView.style.display = 'none';
    confirmedView.style.display = 'block';
  });
};

// 3. 他のプレイヤーの履歴（20秒更新）
const setupOtherPlayers = (): void => {
  const container = document.getElementById('history-container') as HTMLElement | null;
  const countEl = document.getElementById('player-count') as HTMLElement | null;
  if (!container || !countEl) return;

  const updatePlayers = () => {
    const newPredictions: number[] = Array.from({ length: 2 }, () => 
      Math.floor(Math.random() * 1000000) + 1
    );

    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = ''; 
      newPredictions.forEach(num => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = num.toLocaleString();
        container.appendChild(chip);
      });
      const randomTotal = Math.floor(Math.random() * 400) + 100;
      countEl.textContent = `${randomTotal}人が予想中`;
      container.style.opacity = '1';
    }, 500);
  };

  updatePlayers();
  setInterval(updatePlayers, 20000);
};

// 初期化
const initApp = (): void => {
  maybeRedirectToResult();
  startCountdown();
  setupPredictionForm();
  setupOtherPlayers();
};

document.addEventListener('DOMContentLoaded', initApp);
