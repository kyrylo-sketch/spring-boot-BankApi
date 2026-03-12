package com.example.BankApi.model;

import jakarta.persistence.Entity;

import java.util.List;

@Entity
public class SavingAccount extends Account{
    private double interestRate;

    public SavingAccount() {
    }

    public SavingAccount(Currency currency, Customer customer) {
        super( currency, customer);
        this.interestRate = 0.05;
    }

    @Override
    public boolean canWithdraw(double amount) {
        if(getBalance()>=amount){
            return true;
        }
        else {
            return false;
        }
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }
}
