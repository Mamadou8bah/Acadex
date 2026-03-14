package com.acadex.school.model;

import com.acadex.common.model.BaseEntity;
import com.acadex.feature.model.FeatureFlag;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "schools")
public class School extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, unique = true)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.STARTER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SchoolStatus status = SchoolStatus.PENDING;

    @ElementCollection
    @CollectionTable(name = "school_features", joinColumns = @JoinColumn(name = "school_id"))
    @Column(name = "feature_flag")
    @Enumerated(EnumType.STRING)
    private Set<FeatureFlag> enabledFeatures = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public SubscriptionPlan getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public SchoolStatus getStatus() {
        return status;
    }

    public void setStatus(SchoolStatus status) {
        this.status = status;
    }

    public Set<FeatureFlag> getEnabledFeatures() {
        return enabledFeatures;
    }

    public void setEnabledFeatures(Set<FeatureFlag> enabledFeatures) {
        this.enabledFeatures = enabledFeatures;
    }
}
