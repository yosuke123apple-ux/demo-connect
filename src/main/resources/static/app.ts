/**
 * The Number Challenge - System Core v2.5
 * 【MINI-X修正完了版：Enter投稿・箱ごといいね・文字数制限】
 */

interface GameState {
    submittedNumber: number | null;
    lastCalculatedRank: number | null;
    lastPlayedDate: string | null;
    playerName: string | null;
    weeklyTotalRank: number;
}

interface Post {
    id: number;
    userName: string;
    content: string;
    likes: number;
    hasLiked?: boolean;
}

let posts: Post[] = [
    { id: 1700000000001, userName: "X_MASTER", content: "777,777が来る予感...", likes: 24, hasLiked: false },
    { id: 1700000000002, userName: "LUNA", content: "今日は素数で攻めるわ", likes: 15, hasLiked: false },
    { id: 1700000000003, userName: "ZERO_G", content: "解析完了まであと3時間！", likes: 42, hasLiked: false }
];

class NumberChallenge {
    private state: GameState;
    private isRevealDay: boolean;
    private todayStr: string;
    private yesterdayStr: string;

    constructor() {
        const now = new Date();
        this.isRevealDay = now.getDate() % 2 === 0; 
        this.todayStr = now.toISOString().split('T')[0];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.yesterdayStr = yesterday.toISOString().split('T')[0];

        this.state = this.loadState();
        this.init();
    }

    private init(): void {
        this.updateUI();
        this.setupEventListeners();
        this.startCountdownTimer();
        this.initMiniX(); // 掲示板を起動
    }
// NumberChallenge クラス内の該当メソッドを差し替えてください

private updateUI(): void {
    const mainBtn = document.getElementById("main-action-btn") as HTMLButtonElement;
    const tagline = document.querySelector(".tagline") as HTMLElement;
    const dynamicPanel = document.getElementById("dynamic-main-panel") as HTMLElement;
    
    if (!mainBtn || !tagline || !dynamicPanel) return;

    if (!this.isRevealDay) {
        // ==========================================
        // 【DAY 1: 投票期間】巨大カウントダウンを表示
        // ==========================================
        tagline.innerText = "【DAY 1: 潜伏】運命をロックせよ";
        
        dynamicPanel.innerHTML = `
            <div class="legend-header">
                <span class="crown">⏳</span>
                <span class="hall-title">受付終了まで</span>
            </div>
            <div class="legend-body" style="padding: 40px 0;">
                <div class="main-score-area">
                    <div class="gold-num" id="main-visual-timer">00:00:00</div>
                    <div class="avg-label">明日の解析開始まで</div>
                </div>
            </div>
        `;
        dynamicPanel.classList.add('is-voting');
        dynamicPanel.classList.remove('is-result');

        mainBtn.innerText = (this.state.lastPlayedDate === this.todayStr) ? "解析中... 明日0時に公開" : "奇跡に挑む";
        mainBtn.disabled = (this.state.lastPlayedDate === this.todayStr);

    } else {
        // ==========================================
        // 【DAY 2: 結果期間】ランキング1位を表示
        // ==========================================
        tagline.innerText = "【DAY 2: 開花】解析スコア公開中";

        dynamicPanel.innerHTML = `
            <div class="legend-header">
                <span class="crown">👑</span>
                <span class="hall-title">週間ランキング１位</span>
            </div>
            <div class="legend-body">
                <div class="user-display">
                    <span class="name">banna</span><span class="honorific">さん</span>
                </div>
                <div class="main-score-area">
                    <div class="gold-num">7.2<span id="tiso">位</span></div>
                    <div class="avg-label">一週間の平均順位</div>
                </div>
            </div>
        `;
        dynamicPanel.classList.add('is-result');
        dynamicPanel.classList.remove('is-voting');

        if (this.state.lastPlayedDate === this.yesterdayStr) {
            mainBtn.innerText = "本日の解析結果を見る";
            mainBtn.disabled = false;
        } else {
            mainBtn.innerText = "昨日のデータがありません";
            mainBtn.disabled = true;
        }
    }
}

private startCountdownTimr(): void {
    const footerTimer = document.getElementById("countdown-timer");
    
    setInterval(() => {
        const diff = new Date().setHours(24, 0, 0, 0) - new Date().getTime();
        if (diff <= 0) return location.reload();

        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        const timeStr = `${h}:${m}:${s}`;

        if (footerTimer) footerTimer.innerText = timeStr;
        
        // メイン画面の巨大タイマーも同時に更新
        const mainVisualTimer = document.getElementById("main-visual-timer");
        if (mainVisualTimer) mainVisualTimer.innerText = timeStr;
    }, 1000);
}
private setupEventListeners(): void {
    // --- メインアクションボタンの挙動を厳格化 ---
    document.getElementById("main-action-btn")?.addEventListener("click", () => {
        const hasPlayedToday = this.state.lastPlayedDate === this.todayStr;
        const hasPlayedYesterday = this.state.lastPlayedDate === this.yesterdayStr;

        if (!this.isRevealDay) {
            // 【DAY 1: 潜伏期間】
            if (hasPlayedToday) {
                // すでに入力済みなら何もしない（UI側でボタン無効化されているはずですが念のため）
                alert("現在解析中です。明日0時に結果が公開されます。");
            } else {
                // まだ今日入力していないなら「入力画面」を表示
                document.getElementById("input-overlay")?.classList.add("active");
                // 結果画面は絶対に開かない
                document.getElementById("result-overlay")?.classList.remove("active");
            }
        } else {
            // 【DAY 2: 開花期間】
            if (hasPlayedYesterday) {
                // 昨日ちゃんと入力していたら「結果画面」を表示
                document.getElementById("result-overlay")?.classList.add("active");
            } else {
                // 昨日遊んでいないなら、結果は見せられない
                alert("昨日のプレイデータがありません。次の潜伏期間（明日）をお待ちください。");
            }
        }
    });

    // --- 各種オーバーレイの「閉じる」ボタン ---
    document.getElementById("close-input-btn")?.addEventListener("click", () => {
        document.getElementById("input-overlay")?.classList.remove("active");
    });
    document.getElementById("close-result-btn")?.addEventListener("click", () => {
        document.getElementById("result-overlay")?.classList.remove("active");
    });

    // --- 数字投稿処理 ---
    document.getElementById("submit-destiny")?.addEventListener("click", () => this.handleSubmission());

    // --- シェア & 設定関連 ---
    document.getElementById("share-result-btn")?.addEventListener("click", () => this.shareResult());
    
    document.getElementById("settings-open-btn")?.addEventListener("click", () => {
        const input = document.getElementById("settings-name-input") as HTMLInputElement;
        if (input) input.value = this.state.playerName || "";
        document.getElementById("settings-overlay")?.classList.add("active");
    });

    document.getElementById("save-settings-btn")?.addEventListener("click", () => {
        const input = document.getElementById("settings-name-input") as HTMLInputElement;
        if (input?.value) {
            this.state.playerName = input.value;
            this.saveState();
            alert("設定を保存しました");
            document.getElementById("settings-overlay")?.classList.remove("active");
            this.renderMiniX();
        }
    });

    // --- MINI-X 投稿ロジック ---
    const textarea = document.getElementById("mini-x-textarea") as HTMLTextAreaElement;
    const charCount = document.getElementById("char-count");
    const postBtn = document.getElementById("mini-x-post-btn");

    textarea?.addEventListener("input", () => {
        const len = textarea.value.length;
        if (charCount) {
            charCount.innerText = `${len} / 140`;
            charCount.style.color = len >= 130 ? "#ff4444" : "#555";
        }
    });

    textarea?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            postBtn?.click();
        }
    });

    postBtn?.addEventListener("click", () => {
        const content = textarea.value.trim();
        if (!content || content.length > 140) return;
        const newPost: Post = {
            id: Date.now(),
            userName: this.state.playerName || "名無し",
            content: content,
            likes: 0,
            hasLiked: false
        };
        posts.unshift(newPost);
        textarea.value = "";
        if (charCount) charCount.innerText = "0 / 140";
        this.renderMiniX();
    });

    // 外側クリックで閉じる
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
}
    private initMiniX(): void {
        (window as any).handleLike = (id: number) => {
            const post = posts.find(p => p.id === id);
            if (post && !post.hasLiked) {
                post.likes++;
                post.hasLiked = true;
                this.renderMiniX();
            }
        };
        this.renderMiniX();
    }
private renderMiniX(): void {
    const container = document.getElementById("chart-container");
    if (!container) return;
    
    container.innerHTML = posts.map(post => `
        <div class="mini-x-post" onclick="handleLike(${post.id})">
            <div class="post-header">
                <span class="post-user">@${post.userName}</span>
                <span class="post-time">· ${new Date(post.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-footer">
                <div class="like-container ${post.hasLiked ? 'is-liked' : ''}">
                    ${post.hasLiked ? '❤️' : '🖤'} <span>${post.likes}</span>
                </div>
            </div>
        </div>
    `).join("");
}
    private calculateFinalRank(): void {
        const seed = new Date().getDate();
        const targetNumber = Math.floor(Math.abs(Math.sin(seed) * 1000000));
        const diff = Math.abs((this.state.submittedNumber || 0) - targetNumber);
        this.state.lastCalculatedRank = Math.floor(diff / 10) + 1;
        this.saveState();
    }

    private handleSubmission(): void {
        const numInput = document.getElementById("destiny-number") as HTMLInputElement;
        if (!numInput?.value) return alert("数字を入力してください");
        this.state.submittedNumber = parseInt(numInput.value);
        this.state.lastPlayedDate = this.todayStr;
        this.state.lastCalculatedRank = null;
        this.saveState();
        document.getElementById("input-overlay")?.classList.remove("active");
        this.updateUI();
    }

    private startCountdownTimer(): void {
        const timerDisp = document.getElementById("countdown-timer");
        setInterval(() => {
            const diff = new Date().setHours(24, 0, 0, 0) - new Date().getTime();
            if (diff <= 0) return location.reload();
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            if (timerDisp) timerDisp.innerText = `${h}:${m}:${s}`;
        }, 1000);
    }

    private shareResult(): void {
        const rank = this.state.lastCalculatedRank || "---";
        const text = `【The Number Challenge】\n本日の順位: ${rank}位\n#TheNumberChallenge`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }

    private saveState(): void {
        localStorage.setItem("number_challenge_state", JSON.stringify(this.state));
    }

    private loadState(): GameState {
        const saved = localStorage.getItem("number_challenge_state");
        return saved ? JSON.parse(saved) : {
            submittedNumber: null, lastCalculatedRank: null, lastPlayedDate: null, playerName: null, weeklyTotalRank: 0
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new NumberChallenge();
});