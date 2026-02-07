/**
 * The Number Challenge - System Core v2.5
 * 【MINI-X修正完了版：Enter投稿・箱ごといいね・文字数制限】
 */
var posts = [
    { id: 1700000000001, userName: "X_MASTER", content: "777,777が来る予感...", likes: 24, hasLiked: false },
    { id: 1700000000002, userName: "LUNA", content: "今日は素数で攻めるわ", likes: 15, hasLiked: false },
    { id: 1700000000003, userName: "ZERO_G", content: "解析完了まであと3時間！", likes: 42, hasLiked: false }
];
var NumberChallenge = /** @class */ (function () {
    function NumberChallenge() {
        var now = new Date();
        this.isRevealDay = now.getDate() % 2 === 0;
        this.todayStr = now.toISOString().split('T')[0];
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.yesterdayStr = yesterday.toISOString().split('T')[0];
        this.state = this.loadState();
        this.init();
    }
    NumberChallenge.prototype.init = function () {
        this.updateUI();
        this.setupEventListeners();
        this.startCountdownTimer();
        this.initMiniX(); // 掲示板を起動
    };
    // NumberChallenge クラス内の該当メソッドを差し替えてください
    NumberChallenge.prototype.updateUI = function () {
        var mainBtn = document.getElementById("main-action-btn");
        var tagline = document.querySelector(".tagline");
        var dynamicPanel = document.getElementById("dynamic-main-panel");
        if (!mainBtn || !tagline || !dynamicPanel)
            return;
        if (!this.isRevealDay) {
            // ==========================================
            // 【DAY 1: 投票期間】巨大カウントダウンを表示
            // ==========================================
            tagline.innerText = "【DAY 1: 潜伏】運命をロックせよ";
            dynamicPanel.innerHTML = "\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"legend-header\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <span class=\"crown\">\u23F3</span>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <span class=\"hall-title\">\u53D7\u4ED8\u7D42\u4E86\u307E\u3067</span>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"legend-body\" style=\"padding: 40px 0;\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"main-score-area\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"gold-num\" id=\"main-visual-timer\">00:00:00</div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"avg-label\">\u660E\u65E5\u306E\u89E3\u6790\u958B\u59CB\u307E\u3067</div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 ";
            dynamicPanel.classList.add('is-voting');
            dynamicPanel.classList.remove('is-result');
            mainBtn.innerText = (this.state.lastPlayedDate === this.todayStr) ? "解析中... 明日0時に公開" : "奇跡に挑む";
            mainBtn.disabled = (this.state.lastPlayedDate === this.todayStr);
        }
        else {
            // ==========================================
            // 【DAY 2: 結果期間】ランキング1位を表示
            // ==========================================
            tagline.innerText = "【DAY 2: 開花】解析スコア公開中";
            dynamicPanel.innerHTML = "\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"legend-header\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <span class=\"crown\">\uD83D\uDC51</span>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <span class=\"hall-title\">\u9031\u9593\u30E9\u30F3\u30AD\u30F3\u30B0\uFF11\u4F4D</span>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"legend-body\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"user-display\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <span class=\"name\">banna</span><span class=\"honorific\">\u3055\u3093</span>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"main-score-area\">\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"gold-num\">7.2<span id=\"tiso\">\u4F4D</span></div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 <div class=\"avg-label\">\u4E00\u9031\u9593\u306E\u5E73\u5747\u9806\u4F4D</div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 </div>\n\u00A0 \u00A0 \u00A0 \u00A0 ";
            dynamicPanel.classList.add('is-result');
            dynamicPanel.classList.remove('is-voting');
            if (this.state.lastPlayedDate === this.yesterdayStr) {
                mainBtn.innerText = "本日の解析結果を見る";
                mainBtn.disabled = false;
            }
            else {
                mainBtn.innerText = "昨日のデータがありません";
                mainBtn.disabled = true;
            }
        }
    };
    NumberChallenge.prototype.startCountdownTimr = function () {
        var footerTimer = document.getElementById("countdown-timer");
        setInterval(function () {
            var diff = new Date().setHours(24, 0, 0, 0) - new Date().getTime();
            if (diff <= 0)
                return location.reload();
            var h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            var m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            var s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            var timeStr = "".concat(h, ":").concat(m, ":").concat(s);
            if (footerTimer)
                footerTimer.innerText = timeStr;
            // メイン画面の巨大タイマーも同時に更新
            var mainVisualTimer = document.getElementById("main-visual-timer");
            if (mainVisualTimer)
                mainVisualTimer.innerText = timeStr;
        }, 1000);
    };
    NumberChallenge.prototype.setupEventListeners = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        // --- メインアクションボタンの挙動を厳格化 ---
        (_a = document.getElementById("main-action-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
            var _a, _b, _c;
            var hasPlayedToday = _this.state.lastPlayedDate === _this.todayStr;
            var hasPlayedYesterday = _this.state.lastPlayedDate === _this.yesterdayStr;
            if (!_this.isRevealDay) {
                // 【DAY 1: 潜伏期間】
                if (hasPlayedToday) {
                    // すでに入力済みなら何もしない（UI側でボタン無効化されているはずですが念のため）
                    alert("現在解析中です。明日0時に結果が公開されます。");
                }
                else {
                    // まだ今日入力していないなら「入力画面」を表示
                    (_a = document.getElementById("input-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                    // 結果画面は絶対に開かない
                    (_b = document.getElementById("result-overlay")) === null || _b === void 0 ? void 0 : _b.classList.remove("active");
                }
            }
            else {
                // 【DAY 2: 開花期間】
                if (hasPlayedYesterday) {
                    // 昨日ちゃんと入力していたら「結果画面」を表示
                    (_c = document.getElementById("result-overlay")) === null || _c === void 0 ? void 0 : _c.classList.add("active");
                }
                else {
                    // 昨日遊んでいないなら、結果は見せられない
                    alert("昨日のプレイデータがありません。次の潜伏期間（明日）をお待ちください。");
                }
            }
        });
        // --- 各種オーバーレイの「閉じる」ボタン ---
        (_b = document.getElementById("close-input-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
            var _a;
            (_a = document.getElementById("input-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
        });
        (_c = document.getElementById("close-result-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
            var _a;
            (_a = document.getElementById("result-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
        });
        // --- 数字投稿処理 ---
        (_d = document.getElementById("submit-destiny")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () { return _this.handleSubmission(); });
        // --- シェア & 設定関連 ---
        (_e = document.getElementById("share-result-btn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function () { return _this.shareResult(); });
        (_f = document.getElementById("settings-open-btn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () {
            var _a;
            var input = document.getElementById("settings-name-input");
            if (input)
                input.value = _this.state.playerName || "";
            (_a = document.getElementById("settings-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("active");
        });
        (_g = document.getElementById("save-settings-btn")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", function () {
            var _a;
            var input = document.getElementById("settings-name-input");
            if (input === null || input === void 0 ? void 0 : input.value) {
                _this.state.playerName = input.value;
                _this.saveState();
                alert("設定を保存しました");
                (_a = document.getElementById("settings-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
                _this.renderMiniX();
            }
        });
        // --- MINI-X 投稿ロジック ---
        var textarea = document.getElementById("mini-x-textarea");
        var charCount = document.getElementById("char-count");
        var postBtn = document.getElementById("mini-x-post-btn");
        textarea === null || textarea === void 0 ? void 0 : textarea.addEventListener("input", function () {
            var len = textarea.value.length;
            if (charCount) {
                charCount.innerText = "".concat(len, " / 140");
                charCount.style.color = len >= 130 ? "#ff4444" : "#555";
            }
        });
        textarea === null || textarea === void 0 ? void 0 : textarea.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                postBtn === null || postBtn === void 0 ? void 0 : postBtn.click();
            }
        });
        postBtn === null || postBtn === void 0 ? void 0 : postBtn.addEventListener("click", function () {
            var content = textarea.value.trim();
            if (!content || content.length > 140)
                return;
            var newPost = {
                id: Date.now(),
                userName: _this.state.playerName || "名無し",
                content: content,
                likes: 0,
                hasLiked: false
            };
            posts.unshift(newPost);
            textarea.value = "";
            if (charCount)
                charCount.innerText = "0 / 140";
            _this.renderMiniX();
        });
        // 外側クリックで閉じる
        document.querySelectorAll('.overlay').forEach(function (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay)
                    overlay.classList.remove('active');
            });
        });
    };
    NumberChallenge.prototype.initMiniX = function () {
        var _this = this;
        window.handleLike = function (id) {
            var post = posts.find(function (p) { return p.id === id; });
            if (post && !post.hasLiked) {
                post.likes++;
                post.hasLiked = true;
                _this.renderMiniX();
            }
        };
        this.renderMiniX();
    };
    NumberChallenge.prototype.renderMiniX = function () {
        var container = document.getElementById("chart-container");
        if (!container)
            return;
        container.innerHTML = posts.map(function (post) { return "\n        <div class=\"mini-x-post\" onclick=\"handleLike(".concat(post.id, ")\">\n            <div class=\"post-header\">\n                <span class=\"post-user\">@").concat(post.userName, "</span>\n                <span class=\"post-time\">\u00B7 ").concat(new Date(post.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "</span>\n            </div>\n            <p class=\"post-content\">").concat(post.content, "</p>\n            <div class=\"post-footer\">\n                <div class=\"like-container ").concat(post.hasLiked ? 'is-liked' : '', "\">\n                    ").concat(post.hasLiked ? '❤️' : '🖤', " <span>").concat(post.likes, "</span>\n                </div>\n            </div>\n        </div>\n    "); }).join("");
    };
    NumberChallenge.prototype.calculateFinalRank = function () {
        var seed = new Date().getDate();
        var targetNumber = Math.floor(Math.abs(Math.sin(seed) * 1000000));
        var diff = Math.abs((this.state.submittedNumber || 0) - targetNumber);
        this.state.lastCalculatedRank = Math.floor(diff / 10) + 1;
        this.saveState();
    };
    NumberChallenge.prototype.handleSubmission = function () {
        var _a;
        var numInput = document.getElementById("destiny-number");
        if (!(numInput === null || numInput === void 0 ? void 0 : numInput.value))
            return alert("数字を入力してください");
        this.state.submittedNumber = parseInt(numInput.value);
        this.state.lastPlayedDate = this.todayStr;
        this.state.lastCalculatedRank = null;
        this.saveState();
        (_a = document.getElementById("input-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
        this.updateUI();
    };
    NumberChallenge.prototype.startCountdownTimer = function () {
        var timerDisp = document.getElementById("countdown-timer");
        setInterval(function () {
            var diff = new Date().setHours(24, 0, 0, 0) - new Date().getTime();
            if (diff <= 0)
                return location.reload();
            var h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            var m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            var s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            if (timerDisp)
                timerDisp.innerText = "".concat(h, ":").concat(m, ":").concat(s);
        }, 1000);
    };
    NumberChallenge.prototype.shareResult = function () {
        var rank = this.state.lastCalculatedRank || "---";
        var text = "\u3010The Number Challenge\u3011\n\u672C\u65E5\u306E\u9806\u4F4D: ".concat(rank, "\u4F4D\n#TheNumberChallenge");
        window.open("https://twitter.com/intent/tweet?text=".concat(encodeURIComponent(text)), '_blank');
    };
    NumberChallenge.prototype.saveState = function () {
        localStorage.setItem("number_challenge_state", JSON.stringify(this.state));
    };
    NumberChallenge.prototype.loadState = function () {
        var saved = localStorage.getItem("number_challenge_state");
        return saved ? JSON.parse(saved) : {
            submittedNumber: null, lastCalculatedRank: null, lastPlayedDate: null, playerName: null, weeklyTotalRank: 0
        };
    };
    return NumberChallenge;
}());
document.addEventListener("DOMContentLoaded", function () {
    new NumberChallenge();
});
