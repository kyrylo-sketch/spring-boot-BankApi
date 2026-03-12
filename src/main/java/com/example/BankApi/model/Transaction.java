package com.example.BankApi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Transaction {
    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "transaction_seq")
    @SequenceGenerator(name = "transaction_seq", sequenceName = "transaction_seq", allocationSize = 1)
    private int id;
    private TransactionType type;
    private double amount;
    private String description;
    private LocalDateTime date;
    @JsonIgnoreProperties({"transactions", "customer", "accountNumber", "balance", "currency"})
    @ManyToOne(fetch = FetchType.EAGER)
    private Account fromAccount;
    @JsonIgnoreProperties({"transactions", "customer", "accountNumber", "balance", "currency"})
    @ManyToOne(fetch = FetchType.EAGER)
    private Account toAccount;
    private Currency currency;

    public Transaction() {}

    public Transaction(TransactionType type, double amount, Account fromAccount, Currency currency) {
        this.type = type;
        this.amount = amount;
        this.date = LocalDateTime.now();
        this.fromAccount = fromAccount;
        this.currency = currency;
    }

    public Transaction(TransactionType type, double amount, String description, Account fromAccount, Account toAccount, Currency currency) {
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.date = LocalDateTime.now();
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.currency = currency;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Account getFromAccount() {
        return fromAccount;
    }

    public void setFromAccount(Account fromAccount) {
        this.fromAccount = fromAccount;
    }

    public Account getToAccount() {
        return toAccount;
    }

    public void setToAccount(Account toAccount) {
        this.toAccount = toAccount;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", amount=" + amount +
                ", description='" + description + '\'' +
                ", date=" + date +
                ", fromAccount=" + fromAccount +
                ", toAccount=" + toAccount +
                '}';
    }
}
