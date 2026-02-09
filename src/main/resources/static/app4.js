// ランク定義
var TIERS = [
    { name: "CORE LEGEND", max: 100 },
    { name: "HIGH OPERATOR", max: 10000 },
    { name: "COMMONER", max: 1000000 }
];
var RapidMode = /** @class */ (function () {
    function RapidMode() {
        this.target = 0;
        this.myId = '';
        this.cooldownTimer = null;
        this.lastRank = 0;
        this.cooldownUntil = 0;
        var w = window;
        this.apiBase = (w && w.RAPID_API_BASE) ? String(w.RAPID_API_BASE).replace(/\/+$/, '') : '';
        this.useLocalMock = !this.apiBase;
        this.cooldownKey = 'rapid_cooldown_until';
        this.premiumKey = 'rapid_premium';
        this.themeKey = 'rapid_theme';
        this.checkoutUrl = (w && w.PREMIUM_CHECKOUT_URL) ? String(w.PREMIUM_CHECKOUT_URL) : '';
        this.isPremium = false;
        this.retryBtn = document.getElementById('retryBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.subscribeBtn = document.getElementById('subscribeBtn');
        this.managePremiumBtn = document.getElementById('managePremiumBtn');
        this.premiumStateEl = document.getElementById('premiumState');
        this.premiumBadgeEl = document.getElementById('premiumBadge');
        this.themePanelEl = document.getElementById('themePanel');
        this.themeButtons = document.querySelectorAll('.theme-chip');
        this.cooldownEl = document.getElementById('cooldownDisplay');
        this.init();
    }
    RapidMode.prototype.init = function () {
        this.setupRetryButton();
        this.setupShareButton();
        this.setupSubscribeButton();
        this.setupManagePremiumButton();
        this.setupThemeSelector();
        this.restorePremium();
        this.restoreCooldown();
        this.loadStatus();
    };
    RapidMode.prototype.setupRetryButton = function () {
        var _this = this;
        if (!this.retryBtn)
            return;
        var handleClick = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Date.now() < this.cooldownUntil)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.reroll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.retryBtn.addEventListener('click', handleClick);
        this.setRetryLabel();
    };
    RapidMode.prototype.setRetryLabel = function (remainingMs) {
        if (!this.retryBtn)
            return;
        if (!remainingMs || remainingMs <= 0) {
            this.retryBtn.innerText = '再解析を試行する';
            if (this.cooldownEl)
                this.cooldownEl.innerText = '再解析可能';
            return;
        }
        var totalSec = Math.ceil(remainingMs / 1000);
        var min = Math.floor(totalSec / 60);
        var sec = totalSec % 60;
        var mm = String(min).padStart(2, '0');
        var ss = String(sec).padStart(2, '0');
        this.retryBtn.innerText = "\u518D\u89E3\u6790\u307E\u3067 ".concat(mm, ":").concat(ss);
        if (this.cooldownEl)
            this.cooldownEl.innerText = "\u518D\u89E3\u6790\u307E\u3067 ".concat(mm, ":").concat(ss);
    };
    RapidMode.prototype.startCooldown = function (until) {
        var _this = this;
        if (!this.retryBtn)
            return;
        this.retryBtn.disabled = true;
        if (this.cooldownTimer) {
            window.clearInterval(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        var tick = function () {
            var remaining = until - Date.now();
            if (remaining <= 0) {
                if (_this.cooldownTimer) {
                    window.clearInterval(_this.cooldownTimer);
                    _this.cooldownTimer = null;
                }
                _this.retryBtn.disabled = false;
                _this.setRetryLabel();
                return;
            }
            _this.setRetryLabel(remaining);
        };
        tick();
        this.cooldownTimer = window.setInterval(tick, 1000);
    };
    RapidMode.prototype.getCooldownMs = function () {
        return this.isPremium ? 60 * 1000 : 5 * 60 * 1000;
    };
    RapidMode.prototype.restorePremium = function () {
        var saved = localStorage.getItem(this.premiumKey);
        this.isPremium = saved === '1';
        this.updatePremiumUI();
    };
    RapidMode.prototype.setPremium = function (enabled) {
        this.isPremium = enabled;
        if (enabled) {
            localStorage.setItem(this.premiumKey, '1');
        }
        else {
            localStorage.removeItem(this.premiumKey);
        }
        this.updatePremiumUI();
    };
    RapidMode.prototype.updatePremiumUI = function () {
        if (this.premiumStateEl) {
            this.premiumStateEl.textContent = this.isPremium ? 'PREMIUM' : 'FREE';
            this.premiumStateEl.classList.toggle('active', this.isPremium);
        }
        if (this.premiumBadgeEl) {
            this.premiumBadgeEl.classList.toggle('active', this.isPremium);
            this.premiumBadgeEl.setAttribute('aria-hidden', this.isPremium ? 'false' : 'true');
        }
        if (this.managePremiumBtn) {
            this.managePremiumBtn.style.display = this.isPremium ? 'inline-flex' : 'none';
        }
        if (this.subscribeBtn) {
            this.subscribeBtn.textContent = this.isPremium ? 'プレミアム適用済み' : 'プレミアムにする';
            this.subscribeBtn.disabled = this.isPremium;
        }
        if (this.themePanelEl) {
            this.themePanelEl.classList.toggle('active', this.isPremium);
            this.themePanelEl.setAttribute('aria-hidden', this.isPremium ? 'false' : 'true');
        }
    };
    RapidMode.prototype.restoreCooldown = function () {
        var saved = Number(localStorage.getItem(this.cooldownKey));
        if (Number.isFinite(saved) && saved > Date.now()) {
            this.cooldownUntil = saved;
            this.startCooldown(saved);
        }
        else if (saved) {
            localStorage.removeItem(this.cooldownKey);
        }
    };
    RapidMode.prototype.persistCooldown = function (until) {
        if (until > Date.now()) {
            localStorage.setItem(this.cooldownKey, String(until));
        }
        else {
            localStorage.removeItem(this.cooldownKey);
        }
    };
    RapidMode.prototype.setupShareButton = function () {
        var _this = this;
        if (!this.shareBtn)
            return;
        this.shareBtn.addEventListener('click', function () {
            var _a;
            var tierEl = document.getElementById('tierDisplay');
            var tierName = (tierEl === null || tierEl === void 0 ? void 0 : tierEl.innerText) || 'ANALYZING...';
            var rank = _this.lastRank || _this.target;
            var text = "\u3010MILLION CORE | RAPID\u3011\n\u62BD\u9078\u756A\u53F7: ".concat(_this.target.toLocaleString(), "\n\u78BA\u5B9A\u9806\u4F4D: ").concat(rank.toLocaleString(), "\u4F4D\n\u79F0\u53F7: ").concat(tierName);
            if (navigator.share) {
                navigator.share({ text: text }).catch(function () { return undefined; });
                return;
            }
            if ((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText) {
                navigator.clipboard.writeText(text);
                _this.shareBtn.innerText = 'コピーしました';
                window.setTimeout(function () {
                    if (_this.shareBtn)
                        _this.shareBtn.innerText = '結果を共有する';
                }, 2000);
            }
        });
    };
    RapidMode.prototype.setupSubscribeButton = function () {
        if (!this.subscribeBtn)
            return;
        this.subscribeBtn.addEventListener('click', function () {
            if (this.checkoutUrl) {
                window.location.href = this.checkoutUrl;
                return;
            }
            this.setPremium(true);
            alert('決済URL未設定のため、プレミアムを仮適用しました（この端末のみ）。');
        }.bind(this));
    };
    RapidMode.prototype.setupManagePremiumButton = function () {
        if (!this.managePremiumBtn)
            return;
        this.managePremiumBtn.addEventListener('click', function () {
            if (!this.isPremium)
                return;
            this.setPremium(false);
        }.bind(this));
    };
    RapidMode.prototype.setupThemeSelector = function () {
        var _this = this;
        if (!this.themeButtons || !this.themeButtons.length)
            return;
        this.themeButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var theme = btn.dataset.theme || '';
                if (!_this.isPremium) {
                    alert('プレミアムのみ変更できます');
                    return;
                }
                _this.applyTheme(theme);
            });
        });
        var saved = localStorage.getItem(this.themeKey) || 'aurora';
        this.applyTheme(saved, true);
    };
    RapidMode.prototype.applyTheme = function (theme, silent) {
        var _this = this;
        var body = document.body;
        body.setAttribute('data-theme', theme);
        localStorage.setItem(this.themeKey, theme);
        if (this.themeButtons) {
            this.themeButtons.forEach(function (b) { return b.classList.toggle('active', b.dataset.theme === theme); });
        }
        if (!silent) {
            this.flashTheme();
        }
    };
    RapidMode.prototype.flashTheme = function () {
        document.body.classList.add('theme-flash');
        window.setTimeout(function () { return document.body.classList.remove('theme-flash'); }, 400);
    };
    RapidMode.prototype.loadStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.useLocalMock) {
                            this.applyStatus(this.buildMockStatus());
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.apiBase, "/api/rapid/status"))];
                    case 2:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error('status not ok');
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _a.sent();
                        this.applyStatus(data);
                        return [3 /*break*/, 5];
                    case 4:
                        _a.sent();
                        this.applyStatus(this.buildMockStatus());
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RapidMode.prototype.reroll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, until, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.useLocalMock) {
                            this.cooldownUntil = Date.now() + this.getCooldownMs();
                            this.persistCooldown(this.cooldownUntil);
                            this.startCooldown(this.cooldownUntil);
                            this.applyStatus(this.buildMockStatus());
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.apiBase, "/api/rapid/reroll"), { method: 'POST' })];
                    case 2:
                        res = _a.sent();
                        if (res.status === 429) {
                            until = Number(res.statusText);
                            if (Number.isFinite(until)) {
                                this.cooldownUntil = until;
                                this.persistCooldown(until);
                                this.startCooldown(until);
                            }
                            return [2 /*return*/];
                        }
                        if (!res.ok)
                            throw new Error('reroll not ok');
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _a.sent();
                        this.applyStatus(data);
                        return [3 /*break*/, 5];
                    case 4:
                        _a.sent();
                        this.cooldownUntil = Date.now() + this.getCooldownMs();
                        this.persistCooldown(this.cooldownUntil);
                        this.startCooldown(this.cooldownUntil);
                        this.applyStatus(this.buildMockStatus());
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RapidMode.prototype.applyStatus = function (data) {
        var result = data.result;
        this.cooldownUntil = data.cooldownUntil || 0;
        this.persistCooldown(this.cooldownUntil);
        this.target = result.target;
        this.myId = result.myId;
        var rank = Number.isFinite(result.rank) ? result.rank : result.target;
        this.lastRank = rank;
        var targetEl = document.getElementById('targetDisplay');
        if (targetEl)
            targetEl.innerText = this.target.toLocaleString();
        this.renderTop3(result.top3 || []);
        this.renderNearby(result.nearby || []);
        this.renderHistory(data.history || []);
        this.animateRank(result.tier, rank);
        if (Date.now() < this.cooldownUntil) {
            this.startCooldown(this.cooldownUntil);
        }
        else if (this.retryBtn) {
            this.retryBtn.disabled = false;
        }
    };
    RapidMode.prototype.renderTop3 = function (list) {
        var container = document.getElementById('top3Container');
        var html = list.map(function (p) { return "\n      <div class=\"rank-item ".concat(p.no === 1 ? 'tier-1' : '', "\">\n        <div class=\"r-info\">\n          <span class=\"r-no\">NO.0").concat(p.no, "</span>\n          <span class=\"r-name\">").concat(p.id, "</span>\n        </div>\n        <span class=\"r-val\">").concat(p.rank.toLocaleString(), "\u4F4D</span>\n      </div>\n    "); }).join('');
        container.innerHTML = html;
    };
    RapidMode.prototype.renderNearby = function (players) {
        var container = document.getElementById('nearbyContainer');
        var sorted = players.slice().sort(function (a, b) { return a.rank - b.rank; });
        container.innerHTML = sorted.map(function (p) { return "\n      <div class=\"rank-item ".concat(p.isMe ? 'is-me' : 'is-others', "\">\n        <div class=\"r-info\">\n          <span class=\"r-no\">").concat(p.isMe ? '>>' : 'ID', "</span>\n          <span class=\"r-name\">").concat(p.id, "</span>\n        </div>\n        <div class=\"r-val\">").concat(p.rank.toLocaleString(), "\u4F4D</div>\n      </div>\n    "); }).join('');
        container.classList.add('fade-in');
    };
    RapidMode.prototype.renderHistory = function (list) {
        var container = document.getElementById('historyContainer');
        if (!container)
            return;
        if (!list || list.length === 0) {
            container.innerHTML = "<div class=\"rank-item\"><span class=\"r-no\">--</span><span class=\"r-val\">\u5C65\u6B74\u306A\u3057</span></div>";
            return;
        }
        var capped = this.isPremium ? list : list.slice(0, 10);
        container.innerHTML = capped.map(function (h) { return "\n      <div class=\"rank-item\">\n        <div class=\"r-info\">\n          <span class=\"r-no\">".concat(new Date(h.time).toLocaleTimeString().slice(0, 5), "</span>\n          <span class=\"r-name\">").concat(h.tier, "</span>\n        </div>\n        <span class=\"r-val\">").concat(h.rank.toLocaleString(), "\u4F4D</span>\n      </div>\n    "); }).join('');
    };
    RapidMode.prototype.animateRank = function (tierName, rankValue) {
        var _this = this;
        var el = document.getElementById('myRank');
        var tierEl = document.getElementById('tierDisplay');
        var duration = 2000;
        var start = performance.now();
        var finalRank = Number.isFinite(rankValue) ? rankValue : this.target;
        var step = function (now) {
            var progress = Math.min((now - start) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 4);
            var current = Math.floor(ease * finalRank);
            el.innerText = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(step);
            }
            else {
                if (tierName) {
                    var decorated = _this.isPremium ? "".concat(tierName, " \u2022 PRIME") : tierName;
                    tierEl.innerText = decorated;
                    tierEl.classList.add('active');
                    tierEl.classList.toggle('premium', _this.isPremium);
                }
                _this.lastRank = finalRank;
            }
        };
        requestAnimationFrame(step);
    };
    RapidMode.prototype.buildMockStatus = function () {
        var target = Math.floor(Math.random() * 1000000) + 1;
        var tier = this.pickTier(target);
        var myId = this.genId();
        var rank = Math.max(1, Math.min(1000000, target + Math.floor((Math.random() - 0.5) * 5000)));
        var top3 = [
            { no: 1, rank: 12, id: this.genId() },
            { no: 2, rank: 248, id: this.genId() },
            { no: 3, rank: 5087, id: this.genId() }
        ];
        var nearby = [
            { id: this.genId(), rank: Math.max(1, Math.floor(target * 0.98)), isMe: false },
            { id: myId, rank: rank, isMe: true },
            { id: this.genId(), rank: Math.floor(target * 1.02), isMe: false },
            { id: this.genId(), rank: Math.floor(target * 1.05), isMe: false }
        ];
        var historyCount = this.isPremium ? 20 : 10;
        var history = Array.from({ length: historyCount }, function (_, i) {
            var r = Math.max(1, Math.min(1000000, target + (i + 1) * 123));
            return {
                time: Date.now() - (i + 1) * 600000,
                rank: r,
                tier: this.pickTier(r)
            };
        }.bind(this));
        return {
            now: Date.now(),
            cooldownUntil: this.cooldownUntil,
            result: { target: target, rank: rank, tier: tier, myId: myId, top3: top3, nearby: nearby },
            history: history
        };
    };
    RapidMode.prototype.pickTier = function (rank) {
        var _a;
        for (var _i = 0, TIERS_1 = TIERS; _i < TIERS_1.length; _i++) {
            var t = TIERS_1[_i];
            if (rank <= t.max)
                return t.name;
        }
        return (_a = TIERS[TIERS.length - 1]) === null || _a === void 0 ? void 0 : _a.name;
    };
    RapidMode.prototype.genId = function () {
        var prefix = ["UNIT", "NODE", "USER", "CORE"];
        var num = Math.floor(Math.random() * 9000) + 1000;
        return "".concat(prefix[Math.floor(Math.random() * prefix.length)], "_").concat(num);
    };
    return RapidMode;
}());
new RapidMode();

// TypeScript helper for async/await in plain JS
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}
