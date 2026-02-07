package app;

import java.util.Scanner;

public class RobustChatBot {

    // 定数
    public static final String GREETING = "こんにちは！私は頑丈なチャットボットです。";
    public static final String EXIT_MSG = "さようなら！";
    public static final String UNKNOWN_MSG = "ごめんなさい、よくわかりません。";

    public static void main(String[] args) {
        // ScannerをUTF-8指定で作成（文字化け対策）
        Scanner sc = new Scanner(System.in, "UTF-8");

        printMessage(GREETING);

        while (true) {
            System.out.print("あなた: ");
            String input = sc.nextLine();

            // 入力を正規化
            input = normalize(input);

            // デバッグ表示（どんな文字列として取得されているか確認用）
            System.out.println("DEBUG: [" + input + "]");

            // 入力に応じて返答
            if (input.equalsIgnoreCase("こんにちは") || input.equalsIgnoreCase("hello")) {
                printMessage("チャットボット: こんにちは！");
            } else if (input.equalsIgnoreCase("元気?") || input.equalsIgnoreCase("元気？")) {
                printMessage("チャットボット: 元気ですよ！");
            } else if (input.equalsIgnoreCase("さようなら")) {
                printMessage(EXIT_MSG);
                break; // ループ終了
            } else {
                printMessage(UNKNOWN_MSG);
            }
        }

        sc.close(); // Scannerを閉じる
    }

    // メッセージ表示用関数
    public static void printMessage(String message) {
        System.out.println(message);
    }

    // 入力を正規化する関数
    public static String normalize(String input) {
        if (input == null) return "";

        // 前後の空白を削除（Java 11以降なら strip() を使用）
        input = input.strip();

        // 全角記号を半角に変換
        input = input.replace('？', '?').replace('！', '!');

        // 改行・タブなどを削除
        input = input.replaceAll("[\\n\\r\\t]", "");

        return input;
    }
}
