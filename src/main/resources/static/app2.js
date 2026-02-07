/**
 * デジタル数字予想ゲーム - 保存機能付き
 */
var STORAGE_KEY = 'user_prediction_data';
var STORAGE_TIME_KEY = 'user_prediction_time';
var getResultAt = function (baseTime) {
    var now = baseTime ? new Date(baseTime) : new Date();
    var target = new Date(now);
    target.setDate(now.getDate() + 1);
    target.setHours(0, 0, 0, 0);
    return target;
};
var maybeRedirectToResult = function () {
    var savedData = localStorage.getItem(STORAGE_KEY);
    var savedTime = localStorage.getItem(STORAGE_TIME_KEY);
    if (!savedData || !savedTime)
        return;
    var resultAt = getResultAt(Number(savedTime)).getTime();
    if (Date.now() >= resultAt) {
        window.location.href = 'index3.html';
    }
};
// 1. カウントダウンタイマー
var startCountdown = function () {
    var update = function () {
        var now = new Date();
        var savedTime = localStorage.getItem(STORAGE_TIME_KEY);
        var target = savedTime ? getResultAt(Number(savedTime)) : getResultAt();
        var diff = target.getTime() - now.getTime();
        if (diff <= 0) {
            maybeRedirectToResult();
            return;
        }
        var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        var m = Math.floor((diff / (1000 * 60)) % 60);
        var s = Math.floor((diff / 1000) % 60);
        var hEl = document.getElementById('hours-val');
        var mEl = document.getElementById('minutes-val');
        var sEl = document.getElementById('seconds-val');
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
var setupPredictionForm = function () {
    var inputEl = document.getElementById('user-predict');
    var submitBtn = document.getElementById('submit-btn');
    var inputView = document.getElementById('input-view');
    var confirmedView = document.getElementById('confirmed-view');
    var displayNum = document.getElementById('display-number');
    if (!inputEl || !submitBtn || !inputView || !confirmedView || !displayNum)
        return;
    // --- 【追加】保存されたデータがあるかチェック ---
    var savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        displayNum.textContent = parseInt(savedData).toLocaleString();
        inputView.style.display = 'none';
        confirmedView.style.display = 'block';
    }
    submitBtn.addEventListener('click', function () {
        var val = inputEl.value;
        var num = parseInt(val, 10);
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
var setupOtherPlayers = function () {
    var container = document.getElementById('history-container');
    var countEl = document.getElementById('player-count');
    if (!container || !countEl)
        return;
    var updatePlayers = function () {
        var newPredictions = Array.from({ length: 2 }, function () {
            return Math.floor(Math.random() * 1000000) + 1;
        });
        container.style.opacity = '0';
        setTimeout(function () {
            container.innerHTML = '';
            newPredictions.forEach(function (num) {
                var chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = num.toLocaleString();
                container.appendChild(chip);
            });
            var randomTotal = Math.floor(Math.random() * 400) + 100;
            countEl.textContent = "".concat(randomTotal, "\u4EBA\u304C\u4E88\u60F3\u4E2D");
            container.style.opacity = '1';
        }, 500);
    };
    updatePlayers();
    setInterval(updatePlayers, 20000);
};
// 初期化
var initApp = function () {
    maybeRedirectToResult();
    startCountdown();
    setupPredictionForm();
    setupOtherPlayers();
};
document.addEventListener('DOMContentLoaded', initApp);
