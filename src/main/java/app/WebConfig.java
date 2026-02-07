package app;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowed = System.getenv().getOrDefault("ALLOWED_ORIGINS", "*");
        registry.addMapping("/api/**")
                .allowedOrigins(allowed.equals("*") ? "*" : allowed.split(","))
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*");
    }
}
