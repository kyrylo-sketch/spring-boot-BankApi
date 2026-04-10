package com.example.BankApi.controller;
//test
import com.example.BankApi.model.Account;
import com.example.BankApi.model.Customer;
import com.example.BankApi.model.Transaction;
import com.example.BankApi.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class AccountController {

    @Autowired
    private AccountService service;


    @GetMapping("/accounts")
    public List<Account> getAccounts() {
        return service.getAccounts();
    }

    @GetMapping("/accounts/{id}")
    public Account getAccountById(@PathVariable int id) {
        return service.getAccountById(id);
    }

    @PostMapping("/accounts")
    public void addAccount(@RequestBody Account account) {
        service.addAccount(account);
    }

    @PutMapping("/accounts")
    public void updateAccount(@RequestBody Account account) {
        service.updateAccount(account);
    }

    @DeleteMapping("/accounts/{id}")
    public void deleteAccountById(@PathVariable int id) {
        service.deleteAccountById(id);
    }

    @PostMapping("/account/transaction")
    public ResponseEntity<String> makeTransaction(@RequestBody Map<String, Object> body) {
        int fromAccountId = (int) body.get("fromAccountId");
        int toAccountId   = (int) body.get("toAccountId");
        double amount     = ((Number) body.get("amount")).doubleValue();
        String description = (String) body.get("description");
        return service.makeTransactionById(fromAccountId, toAccountId, amount, description);
    }

    @PutMapping("/account/{id}/deposit/{amount}")
    public void deposit(@PathVariable int id ,@PathVariable int amount){
        service.depositById(id,amount);
    }

    @PutMapping("/account/{id}/withdraw/{amount}")
    public void withdraw(@PathVariable int id, @PathVariable double amount){
        service.withdrawById(id,amount);
    }

    @GetMapping("/account/{id}/transactions")
    public List<Transaction> getTransactions(@PathVariable int id){
        return service.getTransactionsById(id);
    }
}
