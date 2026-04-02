package com.example.BankApi.service;

import com.example.BankApi.model.Customer;
import com.example.BankApi.repository.CustomerRepo;
import com.example.BankApi.model.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private CustomerRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user details for user {}", username);
        Customer customer = repo.findByUsername(username);

        if (customer == null) {
            System.out.println("User not found");
            log.warn("User details not found for user{}", username);
            throw new UsernameNotFoundException("User not found");
        }

        log.info("User details found for user {}", username);
        return new UserPrincipal(customer);
    }
}
