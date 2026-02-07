package app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        // GUI（SystemTray）を使えるように設定
        System.setProperty("java.awt.headless", "false"); 
        SpringApplication.run(DemoApplication.class, args);
    }
}