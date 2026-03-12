package com.example.BankApi.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "refresh_seq")
    @SequenceGenerator(name = "refresh_seq", sequenceName = "refresh_seq", allocationSize = 1)
    private int id;
    private String token;
    private LocalDateTime expiryAt;
    @OneToOne
    private Customer customer;

    public RefreshToken() {}

    public RefreshToken(String token, LocalDateTime expiryAt, Customer customer) {
        this.token = token;
        this.expiryAt = expiryAt;
        this.customer = customer;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiryAt() {
        return expiryAt;
    }

    public void setExpiryAt(LocalDateTime expiryAt) {
        this.expiryAt = expiryAt;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
