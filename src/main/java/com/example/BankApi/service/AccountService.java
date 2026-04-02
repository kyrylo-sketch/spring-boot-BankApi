package com.example.BankApi.service;

import com.example.BankApi.model.Account;
import com.example.BankApi.model.Transaction;
import com.example.BankApi.model.TransactionType;
import com.example.BankApi.repository.AccountRepo;
import com.example.BankApi.repository.CustomerRepo;
import com.example.BankApi.repository.TransactionRepo;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
public class AccountService {

    @Autowired
    private AccountRepo repository;

    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private CurrencyService currencyService;

    public List<Account> getAccounts(){
        return repository.findAll();
    }

    public Account getAccountById(int id){
        return repository.findById(id).orElse(null);
    }

    public void addAccount(Account account){
        repository.save(account);
    }

    public void updateAccount(Account account){
        repository.save(account);
    }

    public void deleteAccountById(int id){
        repository.deleteById(id);
    }

    public ResponseEntity<String> depositById(int id, double amount){
        log.info("Deposit request: accountId={}, amount={}", id, amount);
        if(amount <= 0){
            log.warn("Deposit failed: negative amount={} for accountId={}", amount, id);
            return new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST);
        }
        else {
            Account account = getAccountById(id);
            Transaction transaction = new Transaction(TransactionType.DEPOSIT, amount, account, account.getCurrency());

            Transaction accountTransaction = transactionRepo.save(transaction);
            account.addTransaction(accountTransaction);
            account.deposit(amount);

            updateAccount(account);

            log.info("Deposit successful: accountId={}, amount={}", account.getId(), amount);
            return new ResponseEntity<>("Account deposited successfully", HttpStatus.OK);
        }

    }

    public ResponseEntity<String> withdrawById(int id, double amount){
        log.info("Withdraw request: accountId={}, amount={}", id, amount);
        Account account = getAccountById(id);
        if(amount<=0){
            log.warn("Withdraw failed: negative amount={} for accountId={}", amount, id);
            return new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST);
        }
        else if(account.canWithdraw(amount)){
            account.setBalance(account.getBalance()-amount);

            Transaction transaction = new Transaction(TransactionType.WITHDRAW, amount, account, account.getCurrency());
            Transaction accountTransaction = transactionRepo.save(transaction);
            account.addTransaction(accountTransaction);

            updateAccount(account);
            log.info("Withdraw successful: accountId={}, amount={}", account.getId(), amount);
            return new ResponseEntity<>( HttpStatus.OK);
        }else {
            log.warn("Withdraw failed: enough money amount={} for accountId={}", amount, id);
            return new ResponseEntity<>("You don't have enough money",HttpStatus.BAD_REQUEST);
        }
    }

    public List<Transaction> getTransactionsById(int id){
        Account account = getAccountById(id);
        return account.getTransactions();
    }

    public ResponseEntity<String> makeTransactionById(int fromAccountId,
                                                      int toAccountId,
                                                      double amount,
                                                      String description){
        log.info("Transaction request: fromAccountId={} for toAccountId={}, amount={}, description={}", fromAccountId, toAccountId, amount, description);
        if(amount <= 0){
            log.warn("Transaction failed: negative amount{} for accountId={}", amount, fromAccountId);
            return new ResponseEntity<>("Amount can't be negative", HttpStatus.BAD_REQUEST);
        }
        Account fromAccount = getAccountById(fromAccountId);
        Account toAccount = getAccountById(toAccountId);

        Transaction fromTransaction = new Transaction(TransactionType.SEND, amount, description, fromAccount, toAccount, fromAccount.getCurrency());
        double amountTo = 0;
        try {
            amountTo = currencyService.convert(amount,fromAccount.getCurrency(), toAccount.getCurrency());
        } catch (IOException | InterruptedException e) {
            log.error("Currency conversion failed", e);
            throw new RuntimeException(e);
        }
        Transaction toTransaction = new Transaction(TransactionType.RECEIVE, amountTo, description, fromAccount, toAccount, toAccount.getCurrency());


           // withdrawById(fromAccount.getId(), transaction.getAmount());

            //ResponseEntity<String> result = withdrawById(fromAccount.getId(), amount);
            if(fromAccount.canWithdraw(amount)){
                //depositById(toAccount.getId(), amountTo);

                fromAccount.setBalance(fromAccount.getBalance()-amount);
                toAccount.deposit(amountTo);

                Transaction savedFrom = transactionRepo.save(fromTransaction);
                Transaction savedTo = transactionRepo.save(toTransaction);

                fromAccount.addTransaction(savedFrom);
                toAccount.addTransaction(savedTo);

                updateAccount(toAccount);
                updateAccount(fromAccount);

                log.info("Transaction successful: fromAccountId={} for toAccountId={}, amount={}", fromAccountId,toAccountId, amount);
                return new ResponseEntity<>("transaction was correct", HttpStatus.OK);
            }
        else{
            log.warn("Transaction failed: fromAccountId={} for toAccountId={}, amount={}", fromAccountId, toAccountId, amount);
            return new ResponseEntity<>("something went wrong",HttpStatus.BAD_REQUEST);
        }
    }

}
