package com.acadex.academic.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "school_classes")
public class SchoolClass extends TenantScopedEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String levelName;

    private UUID classTeacherId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLevelName() { return levelName; }
    public void setLevelName(String levelName) { this.levelName = levelName; }
    public UUID getClassTeacherId() { return classTeacherId; }
    public void setClassTeacherId(UUID classTeacherId) { this.classTeacherId = classTeacherId; }
}
