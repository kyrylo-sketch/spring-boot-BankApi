package com.example.BankApi.service;

import com.example.BankApi.model.Transaction;
import com.example.BankApi.repository.TransactionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepo repository;

    public List<Transaction> getTransactions(){
        return repository.findAll();
    }

    public Transaction getTransactionById(int id){
        return repository.findById(id).orElse(null);
    }

    public void addTransaction(Transaction transaction){
        repository.save(transaction);
    }

    public void updateTransaction(Transaction transaction){
        repository.save(transaction);
    }

    public void deleteTransactionById(int id){
        repository.deleteById(id);
    }
}
