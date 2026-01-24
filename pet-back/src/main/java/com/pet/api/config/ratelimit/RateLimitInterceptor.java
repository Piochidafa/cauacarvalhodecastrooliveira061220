package com.pet.api.config.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    
    private final Map<String, UserRequestInfo> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return true;
        }
        
        String username = authentication.getName();
        long currentTimeMillis = System.currentTimeMillis();
        
        UserRequestInfo userInfo = requestCounts.computeIfAbsent(username, k -> new UserRequestInfo());
        
        if (currentTimeMillis - userInfo.getWindowStartTime() >= 60000) {
            userInfo.reset(currentTimeMillis);
        }
        
        int currentCount = userInfo.incrementAndGet();
        
        if (currentCount > MAX_REQUESTS_PER_MINUTE) {
            logger.warn("Rate limit excedido para usuário: {} - {} requisições", username, currentCount);
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(String.format(
                    "{\"error\": \"Rate limit exceeded\", \"message\": \"Maximo de %d requisicoes por minuto. Tente novamente em alguns segundos.\"}",
                    MAX_REQUESTS_PER_MINUTE
            ));
            response.getWriter().flush();
            return false;
        }
        
        return true;
    }

    private static class UserRequestInfo {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStartTime;

        public UserRequestInfo() {
            this.windowStartTime = System.currentTimeMillis();
        }

        public int incrementAndGet() {
            return count.incrementAndGet();
        }

        public long getWindowStartTime() {
            return windowStartTime;
        }

        public void reset(long newStartTime) {
            this.windowStartTime = newStartTime;
            this.count.set(0);
        }
    }
}
