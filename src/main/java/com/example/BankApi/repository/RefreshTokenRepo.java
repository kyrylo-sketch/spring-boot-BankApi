package com.example.BankApi.repository;

import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Integer> {
    RefreshToken findByToken(String token);
    RefreshToken findByCustomer(Customer customer);
}
