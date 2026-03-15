package com.example.BankApi.controller;

import com.example.BankApi.model.Account;
import com.example.BankApi.model.Transaction;
import com.example.BankApi.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/transactionsApi")
public class TransactionController {

    @Autowired
    private TransactionService service;


    @GetMapping("/transactions")
    public List<Transaction> getTransactions() {
        return service.getTransactions();
    }

    @GetMapping("/transactions/{id}")
    public Transaction getTransactionById(@PathVariable int id) {
        return service.getTransactionById(id);
    }

    @PostMapping("/transactions")
    public void addTransaction(@RequestBody Transaction transaction) {
        service.addTransaction(transaction);
    }

    @PutMapping("/transactions")
    public void updateTransaction(@RequestBody Transaction transaction) {
        service.updateTransaction(transaction);
    }

    @DeleteMapping("/transactions/{id}")
    public void deleteTransactionById(@PathVariable int id) {
        service.deleteTransactionById(id);
    }
}
