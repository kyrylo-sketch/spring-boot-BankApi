package com.example.BankApi.service;

import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import com.example.BankApi.repository.RefreshTokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Ref;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    public RefreshToken createRefreshToken(Customer customer){
        RefreshToken existing = refreshTokenRepo.findByCustomer(customer);
        if(existing != null){
            refreshTokenRepo.delete(existing);
        }

        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiryAt(LocalDateTime.now().plusDays(7));
        rt.setCustomer(customer);
        return refreshTokenRepo.save(rt);
    }

    public boolean isValid(RefreshToken rt) {
        return rt.getExpiryAt().isAfter(LocalDateTime.now());
    }

    public RefreshToken findByToken(String token){
        return refreshTokenRepo.findByToken(token);
    }
}
