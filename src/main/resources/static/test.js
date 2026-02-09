var btn = document.getElementById("theme-toggle");
btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", function () {
    // クラスを切り替える魔法の言葉は toggle !
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        btn.innerText = "ライトモードへ";
    }
    else {
        btn.innerText = "ダークモードへ";
    }
});
var time = 10;
var id = null;
var disp = document.getElementById("t");
var sBtn = document.getElementById("s");
var rBtn = document.getElementById("r");
// 開始ボタン
sBtn.addEventListener("click", function () {
    if (id)
        return;
    // 開始時に色を黒（または初期色）に戻しておくと親切！
    disp.style.color = "black";
    id = setInterval(function () {
        time--;
        // 文字列に変換して表示
        disp.innerText = String(time);
        if (time <= 0) {
            clearInterval(id);
            id = null;
            disp.style.color = "red";
            alert("終了");
        }
    }, 1000);
});
// リセットボタン
rBtn.addEventListener("click", function () {
    clearInterval(id);
    id = null;
    time = 10; // HTMLが10秒設定ならここも10にする
    disp.innerText = "0:10";
    disp.style.color = "black"; // 色を元に戻す！
});
