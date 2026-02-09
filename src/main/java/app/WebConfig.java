package app;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    @SuppressWarnings("null")
    public void addCorsMappings(CorsRegistry registry) {
        String allowed = System.getenv().getOrDefault("ALLOWED_ORIGINS", "*");
        if (allowed.equals("*")) {
            registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "OPTIONS")
                    .allowedHeaders("*");
        } else {
            String[] origins = Arrays.stream(allowed.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toArray(String[]::new);
            registry.addMapping("/api/**")
                    .allowedOrigins(origins)
                    .allowedMethods("GET", "POST", "OPTIONS")
                    .allowedHeaders("*");
        }
    }
}
