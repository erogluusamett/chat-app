package com.chatapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChatAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatAppApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  ChatApp Backend Başlatıldı!");
        System.out.println("  API: http://localhost:8082/api");
        System.out.println("  WebSocket: ws://localhost:8082/ws");
        System.out.println("==============================================");
    }
}