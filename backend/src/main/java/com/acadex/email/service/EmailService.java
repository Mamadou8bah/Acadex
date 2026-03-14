package com.acadex.email.service;

public interface EmailService {
    void sendEmail(String to, String subject, String html);
}
