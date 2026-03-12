package com.example.BankApi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;

import java.util.List;
import java.util.Random;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = CheckingAccount.class, name = "CheckingAccount"),
        @JsonSubTypes.Type(value = SavingAccount.class,   name = "SavingAccount")
})
public abstract class Account {
    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "account_seq")
    @SequenceGenerator(name = "account_seq", sequenceName = "account_seq", allocationSize = 1)
    protected int id;
    protected int accountNumber;
    protected double balance;
    protected Currency currency;
    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    protected Customer customer;
    @OneToMany(fetch = FetchType.EAGER)
    protected List<Transaction> transactions;

    public Account(){}

    public Account(Currency currency, Customer customer) {
        this.accountNumber = new Random().nextInt(10000);
        this.balance = 0;
        this.currency = currency;
        this.customer = customer;
    }

    public abstract boolean canWithdraw(double amount);

    public void deposit(double amount){
        setBalance(getBalance() + amount);
    }

    public void addTransaction(Transaction transaction){
        transactions.add(transaction);
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(int accountNumber) {
        this.accountNumber = accountNumber;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    @Override
    public String toString() {
        return "Account{" +
                "id=" + id +
                ", accountNumber=" + accountNumber +
                ", balance=" + balance +
                ", currency=" + currency +
                ", customer=" + customer +
                ", transactions=" + transactions +
                '}';
    }
}
