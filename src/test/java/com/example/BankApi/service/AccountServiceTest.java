package com.example.BankApi.service;

import com.example.BankApi.model.*;
import com.example.BankApi.repository.AccountRepo;
import com.example.BankApi.repository.TransactionRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    TransactionRepo transactionRepo;

    @Mock
    AccountRepo accountRepo;

    @Mock
    CurrencyService currencyService;

    @InjectMocks
    AccountService accountService;

    Account account;

    @BeforeEach
    void setUp() {
        account = new SavingAccount();
        account.setId(1);
        account.setBalance(200);
        account.setTransactions(new ArrayList<>());
        account.setCurrency(Currency.EUR);
    }



    @Test
    void shouldIncreaseBalance_whenAmountPositive() {
        //arrange

        when(accountRepo.findById(anyInt())).thenReturn(Optional.of(account));
        when(transactionRepo.save(any())).thenReturn(new Transaction());

        double amount = 100;

        //act
        accountService.depositById(account.getId(), amount);
        double result = account.getBalance();

        //assert
        assertEquals(300, result);
    }

    @Test
    void shouldNotify_whenAmountNegative() {
        //arrange

        double amount = -100;

        //act
        ResponseEntity<String> result = accountService.depositById(1, amount);

        //assert
        assertEquals(new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void withdrawById_WhenEnoughBalanceForSavingAccount() {
        //arrange

        when(accountRepo.findById(anyInt())).thenReturn(Optional.of(account));
        when(transactionRepo.save(any())).thenReturn(new Transaction());

        double amount = 100;

        //act
        ResponseEntity<String> result = accountService.withdrawById(account.getId(), amount);

        //assert
        assertEquals(new ResponseEntity<>( HttpStatus.OK), result);

    }

    @Test
    void withdrawById_WhenEnoughBalanceForCheckingAccount() {
        //arrange
        CheckingAccount account = new CheckingAccount();
        account.setId(1);
        account.setTransactions(new ArrayList<>());
        account.setBalance(10);
        account.setOverdraftLimit(200);

        when(accountRepo.findById(anyInt())).thenReturn(Optional.of(account));
        when(transactionRepo.save(any())).thenReturn(new Transaction());

        double amount = 100;

        //act
        ResponseEntity<String> result = accountService.withdrawById(account.getId(), amount);

        //assert
        assertEquals(new ResponseEntity<>( HttpStatus.OK), result);

    }

    @Test
    void withdrawById_WhenNotEnoughBalanceForSavingAccount() {
        //arrange;

        when(accountRepo.findById(anyInt())).thenReturn(Optional.of(account));

        double amount = 300;

        //act
        ResponseEntity<String> result = accountService.withdrawById(account.getId(), amount);

        //assert
        assertEquals(new ResponseEntity<>("You don't have enough money",HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void withdrawById_WhenNotEnoughBalanceForCheckingAccount() {
        //arrange
        CheckingAccount account = new CheckingAccount();
        account.setId(1);
        account.setTransactions(new ArrayList<>());
        account.setBalance(50);
        account.setOverdraftLimit(50);

        when(accountRepo.findById(anyInt())).thenReturn(Optional.of(account));

        double amount = 200;

        //act
        ResponseEntity<String> result = accountService.withdrawById(account.getId(), amount);

        //assert
        assertEquals(new ResponseEntity<>("You don't have enough money",HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void withdrawById_WhenAmountNegative() {
        //arrange
        double amount = -100;

        //act
        ResponseEntity<String> result = accountService.withdrawById(account.getId(), amount);

        //assert
        assertEquals(new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void makeTransactionById_WhenEnoughBalance() throws IOException, InterruptedException {
        Account accountFrom = account;

        Account accountTo = new SavingAccount();
        accountTo.setId(2);
        accountTo.setTransactions(new ArrayList<>());
        accountTo.setBalance(50);
        accountTo.setCurrency(Currency.PLN);

        double amountFrom = 100;

        when(accountRepo.findById(1)).thenReturn(Optional.of(accountFrom));
        when(accountRepo.findById(2)).thenReturn(Optional.of(accountTo));

        when(transactionRepo.save(any())).thenReturn(new Transaction());
        when(currencyService.convert(anyDouble(), any(), any())).thenReturn(90.0);


        //act
        ResponseEntity<String> result = accountService.makeTransactionById(accountFrom.getId(), accountTo.getId(), amountFrom, "present");

        //assert
        assertEquals(new ResponseEntity<>("transaction was correct", HttpStatus.OK), result);
    }

    @Test
    void makeTransactionById_WhenNotEnoughBalance() throws IOException, InterruptedException {
        Account accountFrom = account;

        Account accountTo = new SavingAccount();
        accountTo.setId(2);
        accountTo.setTransactions(new ArrayList<>());
        accountTo.setBalance(50);
        accountTo.setCurrency(Currency.EUR);

        double amountFrom = 500;

        when(accountRepo.findById(1)).thenReturn(Optional.of(accountFrom));
        when(accountRepo.findById(2)).thenReturn(Optional.of(accountTo));


        //act
        ResponseEntity<String> result = accountService.makeTransactionById(accountFrom.getId(), accountTo.getId(), amountFrom, "present");

        //assert
        assertEquals(new ResponseEntity<>("something went wrong",HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void makeTransactionById_WhenAmountIsNegative() {
        //arrage
        double amount = -100;

        //act
        ResponseEntity<String> result = accountService.makeTransactionById(1, 2, amount, "test");

        //assert
        assertEquals(new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST), result);
    }


}