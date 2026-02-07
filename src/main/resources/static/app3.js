const TITLES = [
  { rank: 1, name: "至高核", desc: "唯一無二の核心" },
  { rank: 10, name: "伝説観測者", desc: "伝説の観測者" },
  { rank: 100, name: "数値覇王", desc: "数値の支配者" },
  { rank: 1000, name: "超精度解析官", desc: "超精度解析官" },
  { rank: 5000, name: "特級分析員", desc: "特級分析員" },
  { rank: 15000, name: "熟練オペレーター", desc: "熟練オペレーター" },
  { rank: 50000, name: "デジタル市民", desc: "デジタル市民" },
  { rank: 100000, name: "探究者", desc: "探究者" },
  { rank: 250000, name: "コア・メンバー", desc: "コア・メンバー" },
  { rank: 500000, name: "見習い解析員", desc: "見習い解析員" },
  { rank: 750000, name: "通行人A", desc: "通行人A" },
  { rank: 1000000, name: "深淵の底", desc: "深淵の底" }
];

document.addEventListener('DOMContentLoaded', () => {

  /* ================= 結果表示 ================= */

  const storedPick = localStorage.getItem('user_prediction_data');
  const storedTime = localStorage.getItem('user_prediction_time');
  const userPickNumber = storedPick ? parseInt(storedPick, 10) : 114514;
  const userPick = userPickNumber.toLocaleString();
  document.getElementById('display-pick').innerText = userPick;

  const resultDate = (() => {
    if (storedTime) {
      const base = new Date(Number(storedTime));
      const d = new Date(base);
      d.setDate(base.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d;
  })();

  const dateKey = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}-${String(resultDate.getDate()).padStart(2, '0')}`;
  const rankKey = `daily_result_rank_${dateKey}`;
  const cachedRank = localStorage.getItem(rankKey);

  const hashSeed = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const finalRank = cachedRank
    ? parseInt(cachedRank, 10)
    : (hashSeed(`${userPickNumber}-${dateKey}`) % 1000000) + 1;
  if (!cachedRank) {
    localStorage.setItem(rankKey, String(finalRank));
  }

  document.getElementById('display-rank').innerText = ` ${finalRank.toLocaleString()} 位`;

  const myTitle = TITLES.find(t => finalRank <= t.rank) || TITLES[TITLES.length - 1];

  document.getElementById('display-title').innerText = myTitle.name;

  let collection = JSON.parse(localStorage.getItem('core_collection') || "[]");
  if (!collection.includes(myTitle.name)) {
    collection.push(myTitle.name);
    localStorage.setItem('core_collection', JSON.stringify(collection));
  }

  // ===== Daily history for weekly stats =====
  const historyKey = 'daily_result_history';
  const historyRaw = localStorage.getItem(historyKey);
  let history = [];
  try {
    history = historyRaw ? JSON.parse(historyRaw) : [];
  } catch (_e) {
    history = [];
  }
  if (!history.find(h => h.date === dateKey)) {
    history.unshift({ date: dateKey, rank: finalRank, title: myTitle.name });
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 60)));
  }

  /* ================= カウントダウン ================= */

  function updateCountdown() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = next - now;

    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
    const s = String(Math.floor(diff / 1000) % 60).padStart(2, '0');

    document.getElementById('next-timer').innerText = `${h}:${m}:${s}`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ================= 称号図鑑（下に展開） ================= */

  const viewBtn = document.getElementById('view-collection');
  const titleSection = document.getElementById('title-section');
  const list = document.getElementById('collection-list');
  const countEl = document.getElementById('collection-count');
  const bannerEl = document.getElementById('collection-banner');

  const tierClass = (rank) => {
    if (rank <= 10) return 'tier-s';
    if (rank <= 1000) return 'tier-a';
    if (rank <= 50000) return 'tier-b';
    if (rank <= 250000) return 'tier-c';
    return 'tier-d';
  };

  viewBtn.addEventListener('click', () => {
    const saved = JSON.parse(localStorage.getItem('core_collection') || "[]");

    const unlockedCount = saved.length;
    if (countEl) {
      countEl.textContent = `取得数 ${unlockedCount} / ${TITLES.length}`;
    }
    if (bannerEl) {
      const milestones = [3, 5, 8, 12];
      const next = milestones.find(m => unlockedCount < m);
      if (next) {
        bannerEl.textContent = `次の解放まで ${next - unlockedCount} 個`;
      } else {
        bannerEl.textContent = `コレクション完成おめでとう`;
      }
    }

    list.innerHTML = TITLES.map(t => {
      const isUnlocked = saved.includes(t.name);
      const badge = isUnlocked ? '取得済' : '未取得';
      return `
      <div class="title-item ${isUnlocked ? 'unlocked' : ''} ${tierClass(t.rank)}">
        <div class="title-head">
          <span class="title-name">${isUnlocked ? t.name : '??????'}</span>
          <span class="title-badge">${badge}</span>
        </div>
        <div class="title-desc">
          ${isUnlocked ? t.desc : 'ランク未到達'}
        </div>
      </div>
      `;
    }).join('');

    titleSection.classList.toggle('active');

    viewBtn.innerHTML = titleSection.classList.contains('active')
      ? '📕 称号図鑑を閉じる'
      : '📚 称号図鑑コレクションを開く';

    if (titleSection.classList.contains('active')) {
      titleSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ===== Weekly stats =====
  const weeklyBestEl = document.getElementById('weeklyBest');
  const weeklyCountEl = document.getElementById('weeklyCount');
  const weeklyStreakEl = document.getElementById('weeklyStreak');
  const weeklyRankEl = document.getElementById('weeklyRank');

  const parseDate = (d) => {
    const [y, m, dd] = d.split('-').map(v => parseInt(v, 10));
    return new Date(y, m - 1, dd);
  };

  const nowDate = parseDate(dateKey);
  const weekAgo = new Date(nowDate);
  weekAgo.setDate(nowDate.getDate() - 6);

  const weekItems = history.filter(h => {
    const d = parseDate(h.date);
    return d >= weekAgo && d <= nowDate;
  });
  const weeklyCount = weekItems.length;
  const weeklyBest = weeklyCount ? Math.min(...weekItems.map(h => h.rank)) : finalRank;

  const streakSet = new Set(history.map(h => h.date));
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(nowDate);
    d.setDate(nowDate.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (streakSet.has(key)) streak++;
    else break;
  }

  if (weeklyBestEl) weeklyBestEl.textContent = `${weeklyBest.toLocaleString()}位`;
  if (weeklyCountEl) weeklyCountEl.textContent = `${weeklyCount}回`;
  if (weeklyStreakEl) weeklyStreakEl.textContent = `${streak}日`;

  if (weeklyRankEl) {
    const estimated = Math.max(1, Math.floor(weeklyBest / 10));
    weeklyRankEl.textContent = `${estimated.toLocaleString()}位`;
  }

  /* ================= SNS共有 ================= */

  document.getElementById('share-btn').onclick = () => {
    const text =
`【MILLION CORE】
識別数値: ${userPick}
確定順位: 第${finalRank.toLocaleString()}位
称号: ${myTitle.name}
#MillionCore`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    );
  };

});
