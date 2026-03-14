package com.example.BankApi.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    @Test
    void canWithdraw_WhenEnoughBalanceSaving() {
        //arrange
        SavingAccount savingAccount = new SavingAccount();
        savingAccount.setBalance(500);
        double amount = 100;

        //act
        boolean result = savingAccount.canWithdraw(amount);

        //assert
        assertTrue(result);

    }

    @Test
    void canWithdraw_WhenNotEnoughBalanceSaving() {
        SavingAccount savingAccount = new SavingAccount();
        savingAccount.setBalance(500);
        double amount = 600;

        boolean result = savingAccount.canWithdraw(amount);

        assertFalse(result);
    }

    @Test
    void canWithdraw_WhenEnoghBalanceChecking() {
        CheckingAccount checkingAccount = new CheckingAccount();
        checkingAccount.setBalance(500);
        checkingAccount.setOverdraftLimit(100);
        double amount = 550;

        boolean result = checkingAccount.canWithdraw(amount);

        assertTrue(result);
    }

    @Test
    void canWithdraw_WhenNotEnoghBalanceChecking() {
        CheckingAccount checkingAccount = new CheckingAccount();
        checkingAccount.setBalance(500);
        checkingAccount.setOverdraftLimit(100);
        double amount = 650;

        boolean result = checkingAccount.canWithdraw(amount);

        assertFalse(result);
    }

    @Test
    void deposit_WhenAmountIsPositive() {
        Account account = new SavingAccount();
        account.setBalance(500);
        double amount = 100;

        account.deposit(amount);

        assertEquals(600, account.getBalance());
    }

    @Test
    void deposit_WhenAmountIsNegative() {
        Account account = new SavingAccount();
        account.setBalance(500);
        double amount = -100;

        assertThrows(IllegalArgumentException.class, () -> account.deposit(amount));
    }
}