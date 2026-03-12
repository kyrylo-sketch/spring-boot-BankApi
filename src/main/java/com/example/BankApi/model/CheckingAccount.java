package com.example.BankApi.model;

import jakarta.persistence.Entity;

import java.util.List;

@Entity
public class CheckingAccount extends Account {
    private double overdraftLimit;

    public CheckingAccount() {
    }

    public CheckingAccount(Currency currency, Customer customer) {
        super(currency, customer);
        this.overdraftLimit = 200;
    }

    @Override
    public boolean canWithdraw(double amount) {
        if((getBalance()+overdraftLimit) >= amount) {
            return true;
        }
        else {
            return false;
        }
    }

    public double getOverdraftLimit() {
        return overdraftLimit;
    }

    public void setOverdraftLimit(double overdraftLimit) {
        this.overdraftLimit = overdraftLimit;
    }
}
