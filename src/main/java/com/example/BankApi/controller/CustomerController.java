package com.example.BankApi.controller;

import com.example.BankApi.model.Account;
import com.example.BankApi.model.Customer;
import com.example.BankApi.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @GetMapping("/customers")
    public List<Customer> getCustomers() {
        return service.getCustomers();
    }

    @GetMapping("/customers/{id}")
    public Customer getCustomerById(@PathVariable int id) {
        return service.getCustomerById(id);
    }

    @GetMapping("/customers/{id}/accounts")
    public List<Account> getCustomerAccountsById(@PathVariable int id) {
        return service.getAccountsById(id);
    }

    @PostMapping("/customers")
    public void addCustomer(@RequestBody Customer customer) {
        service.addCustomer(customer);
    }

    @PutMapping("/customers")
    public void updateCustomer(@RequestBody Customer customer) {
        service.updateCustomer(customer);
    }

    @DeleteMapping("/customers/{id}")
    public void deleteCustomerById(@PathVariable int id) {
        service.deleteCustomerById(id);
    }

    @PutMapping("/customer/{id}/account")
    public void addAccount(@RequestBody Account account, @PathVariable int id) {
        service.addAccountById(account, id);
    }
}
