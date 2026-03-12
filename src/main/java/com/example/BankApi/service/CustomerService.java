package com.example.BankApi.service;

import com.example.BankApi.model.Account;
import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import com.example.BankApi.model.Transaction;
import com.example.BankApi.repository.AccountRepo;
import com.example.BankApi.repository.CustomerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    public record Result(String accessToken, String refreshToken, Customer customer) {}

    @Autowired
    private CustomerRepo repository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AccountRepo accountRepo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    RefreshTokenService refreshTokenService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public List<Customer> getCustomers(){
        return repository.findAll();
    }

    public List<Account> getAccountsById(int id){
        Customer customer = getCustomerById(id);
        return customer.getAccounts();
    }

    public Customer getCustomerById(int id){
        return repository.findById(id).orElse(null);
    }

    public void addCustomer(Customer customer){
        repository.save(customer);
    }

    public void updateCustomer(Customer customer){
        repository.save(customer);
    }

    public void deleteCustomerById(int id){
        repository.deleteById(id);
    }

    public void addAccountById(Account account, int id){
        Customer customer = getCustomerById(id);
        account.setCustomer(customer);
        Account saved = accountRepo.save(account);
        customer.getAccounts().add(saved);

        updateCustomer(customer);
    }

    public ResponseEntity<String> register(Customer customer){
        Customer find = repository.findByUsername(customer.getUsername());
        if(find != null){
            return new ResponseEntity<>("Customer with this username already exists", HttpStatus.BAD_REQUEST);
        }else {
            customer.setPassword(encoder.encode(customer.getPassword()));
            customer.setRole("USER");
            repository.save(customer);
            return new ResponseEntity<>(jwtService.generateToken(customer.getUsername()), HttpStatus.OK) ;
        }

    }

    public Result verify(Customer customer){
        Authentication authentication =
                authManager.authenticate(new UsernamePasswordAuthenticationToken(customer.getUsername(), customer.getPassword()));

        if(authentication.isAuthenticated()){
            Customer fullCustomer = repository.findByUsername(customer.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(fullCustomer);
            return new Result(jwtService.generateToken(customer.getUsername()),refreshToken.getToken(), fullCustomer);

        }
        return new Result("fail", "fail",null);
    }



}
