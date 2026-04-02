package com.example.BankApi.service;

import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import com.example.BankApi.repository.RefreshTokenRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Ref;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    public RefreshToken createRefreshToken(Customer customer){
        log.info("Creating refresh token request: customerId={}", customer.getId());
        RefreshToken existing = refreshTokenRepo.findByCustomer(customer);
        if(existing != null){
            refreshTokenRepo.delete(existing);
            log.info("Refresh token has been deleted");
        }

        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiryAt(LocalDateTime.now().plusDays(7));
        rt.setCustomer(customer);
        log.info("Created refresh token successful: customerId={}", customer.getId());
        return refreshTokenRepo.save(rt);
    }

    public boolean isValid(RefreshToken rt) {
        log.info("Validating refresh token request: customerId={}", rt.getCustomer().getId());
        return rt.getExpiryAt().isAfter(LocalDateTime.now());
    }

    public RefreshToken findByToken(String token){
        log.info("Finding refresh token request: token={}", token);
        return refreshTokenRepo.findByToken(token);
    }
}
