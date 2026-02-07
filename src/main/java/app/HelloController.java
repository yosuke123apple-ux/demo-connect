

package app;
//このクラスが属するパッケージ名
//このクラスが属するパッケージ名
// Spring Boot のアノテーションを使うためのインポート
// @RestController：このクラスが REST API を提供するコントローラーであることを示す
// @GetMapping：GETリクエストの URL をこのメソッドにマッピングする
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.awt.*;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
//これで通知を扱えるようにする
@RestController
public class HelloController {
//ブラウザからの注文を受け付ける
    // 通常の API
    @GetMapping("/api/hello")
    public String hello() {
        return "Hello from Java (Spring Boot) !!";
    }//文字列に返す

    // 通知を出す API
    @GetMapping("/api/notify")
    public String notifyUser() {
        // 別スレッドで通知を出す
        new Thread(() -> {
            try {
                showNotification("Spring Boot 通知", "これはバックグラウンド通知です！");
            } catch (AWTException e) {
                e.printStackTrace();
            }
        }).start();

        return "通知を送信しました！";
    }

    // ===== Rapid Mode (Server-side cooldown) =====
    private static final long COOLDOWN_MS = 5L * 60L * 1000L;
    private static final Random RNG = new Random();
    private static final Map<String, SessionState> SESSIONS = new ConcurrentHashMap<>();

    @GetMapping("/api/rapid/status")
    public RapidStatus getRapidStatus(HttpSession session) {
        SessionState state = SESSIONS.computeIfAbsent(session.getId(), k -> new SessionState());
        long now = System.currentTimeMillis();
        if (state.result == null) {
            state.cooldownUntil = now + COOLDOWN_MS;
            state.result = buildResult(state);
        }
        return new RapidStatus(now, state.cooldownUntil, state.result, new ArrayList<>(state.history));
    }

    @PostMapping("/api/rapid/reroll")
    public RapidStatus reroll(HttpSession session) {
        SessionState state = SESSIONS.computeIfAbsent(session.getId(), k -> new SessionState());
        long now = System.currentTimeMillis();
        if (now < state.cooldownUntil) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, String.valueOf(state.cooldownUntil));
        }
        state.cooldownUntil = now + COOLDOWN_MS;
        state.result = buildResult(state);
        return new RapidStatus(now, state.cooldownUntil, state.result, new ArrayList<>(state.history));
    }

    private RapidResult buildResult(SessionState state) {
        int target = RNG.nextInt(1_000_000) + 1;
        String tier = tierName(target);
        String myId = genId();

        List<Top3> top3 = new ArrayList<>();
        int[] fixed = new int[]{12, 248, 5087};
        for (int i = 0; i < fixed.length; i++) {
            top3.add(new Top3(i + 1, fixed[i], genId()));
        }

        List<Player> nearby = new ArrayList<>();
        nearby.add(new Player(genId(), Math.max(1, (int) Math.floor(target * 0.98)), false));
        nearby.add(new Player(myId, target, true));
        nearby.add(new Player(genId(), (int) Math.floor(target * 1.02), false));
        nearby.add(new Player(genId(), (int) Math.floor(target * 1.05), false));

        // history (keep latest 10)
        if (state.history == null) state.history = new ArrayDeque<>();
        state.history.addFirst(new HistoryEntry(System.currentTimeMillis(), target, tier));
        while (state.history.size() > 10) state.history.removeLast();

        return new RapidResult(target, tier, myId, top3, nearby);
    }

    private String tierName(int rank) {
        if (rank <= 100) return "CORE LEGEND";
        if (rank <= 10000) return "HIGH OPERATOR";
        return "COMMONER";
    }

    private String genId() {
        String[] prefix = new String[]{"UNIT", "NODE", "USER", "CORE"};
        int num = RNG.nextInt(9000) + 1000;
        return prefix[RNG.nextInt(prefix.length)] + "_" + num;
    }

    private static class SessionState {
        long cooldownUntil = 0;
        RapidResult result = null;
        Deque<HistoryEntry> history = new ArrayDeque<>();
    }

    @SuppressWarnings("unused")
    private static class RapidStatus {
        public final long now;
        public final long cooldownUntil;
        public final RapidResult result;
        public final List<HistoryEntry> history;

        private RapidStatus(long now, long cooldownUntil, RapidResult result, List<HistoryEntry> history) {
            this.now = now;
            this.cooldownUntil = cooldownUntil;
            this.result = result;
            this.history = history;
        }
    }

    @SuppressWarnings("unused")
    private static class RapidResult {
        public final int target;
        public final String tier;
        public final String myId;
        public final List<Top3> top3;
        public final List<Player> nearby;

        private RapidResult(int target, String tier, String myId, List<Top3> top3, List<Player> nearby) {
            this.target = target;
            this.tier = tier;
            this.myId = myId;
            this.top3 = top3;
            this.nearby = nearby;
        }
    }

    @SuppressWarnings("unused")
    private static class Top3 {
        public final int no;
        public final int rank;
        public final String id;

        private Top3(int no, int rank, String id) {
            this.no = no;
            this.rank = rank;
            this.id = id;
        }
    }

    @SuppressWarnings("unused")
    private static class Player {
        public final String id;
        public final int rank;
        public final boolean isMe;

        private Player(String id, int rank, boolean isMe) {
            this.id = id;
            this.rank = rank;
            this.isMe = isMe;
        }
    }

    @SuppressWarnings("unused")
    private static class HistoryEntry {
        public final long time;
        public final int rank;
        public final String tier;

        private HistoryEntry(long time, int rank, String tier) {
            this.time = time;
            this.rank = rank;
            this.tier = tier;
        }
    }

    // 通知を出すメソッド
    private void showNotification(String title, String message) throws AWTException {
        if (!SystemTray.isSupported()) {
            System.out.println("SystemTray is not supported!");
            return;
        }

        SystemTray tray = SystemTray.getSystemTray();
               Image image = 
               Toolkit.getDefaultToolkit().createImage("/images/a.png"); // 任意のアイコン
        TrayIcon trayIcon = new TrayIcon(image, "Demo App");
        trayIcon.setImageAutoSize(true);
        tray.add(trayIcon);

        trayIcon.displayMessage(title, message, TrayIcon.MessageType.INFO);

        // 1秒後にトレイから削除（連打されてもゴミが残らないように）
        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
        tray.remove(trayIcon);
    }
}
