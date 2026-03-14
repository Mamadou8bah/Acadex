package com.acadex.communication.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "message_threads")
public class MessageThread extends TenantScopedEntity {

    @Column(nullable = false)
    private UUID senderUserId;

    @Column(nullable = false)
    private UUID recipientUserId;

    @Column(nullable = false, length = 4000)
    private String body;

    public UUID getSenderUserId() { return senderUserId; }
    public void setSenderUserId(UUID senderUserId) { this.senderUserId = senderUserId; }
    public UUID getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(UUID recipientUserId) { this.recipientUserId = recipientUserId; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
