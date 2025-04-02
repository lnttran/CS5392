package com.example.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private static JwtUtil instance;

    public JwtUtil() {
        instance = this;
    }

    public static JwtUtil getInstance() {
        return instance;
    }

    public static String generateToken(String username) {
        JwtUtil jwtUtil = getInstance();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtUtil.expirationTime))
                .signWith(SignatureAlgorithm.HS512, jwtUtil.secretKey)
                .compact();
    }

    public static String extractUsername(String token) {
        JwtUtil jwtUtil = getInstance();
        String secretKey = jwtUtil.secretKey;
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
}