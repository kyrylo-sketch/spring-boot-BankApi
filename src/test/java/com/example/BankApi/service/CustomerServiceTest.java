package com.example.BankApi.service;

import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import com.example.BankApi.repository.CustomerRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    CustomerRepo repository;

    @Mock
    JWTService jwtService;

    @Mock
    AuthenticationManager authManager;

    @Mock
    RefreshTokenService refreshTokenService;

    @InjectMocks
    CustomerService customerService;

    BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1);
        customer.setUsername("username");
        customer.setPassword("password");
        customer.setEmail("email");
    }

    @Test
    void register_WhenCustomerIsntFound() {
        //arrange
        when(repository.findByUsername(customer.getUsername())).thenReturn(null);

        //act
        ResponseEntity<String> result = customerService.register(customer);

        //assert
        assertEquals(new ResponseEntity<>(jwtService.generateToken(customer.getUsername()), HttpStatus.OK), result);
    }

    @Test
    void register_WhenCustomerIsFound(){
        //arrange
        when(repository.findByUsername(customer.getUsername())).thenReturn(customer);

        //act
        ResponseEntity<String> result = customerService.register(customer);

        //assert
        assertEquals(new ResponseEntity<>("Customer with this username already exists", HttpStatus.BAD_REQUEST), result);
    }

    @Test
    void verify_WhenCustomerIsExist(){
        //arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authManager.authenticate(any())).thenReturn(authentication);
        when(repository.findByUsername(customer.getUsername())).thenReturn(customer);
        when(refreshTokenService.createRefreshToken(customer)).thenReturn(new RefreshToken());
        when(jwtService.generateToken(customer.getUsername())).thenReturn("token");


        //act
        CustomerService.Result result = customerService.verify(customer);

        //assert
        assertNotNull(result);
        assertEquals(customer, result.customer());
    }

    @Test
    void verify_WhenCustomerIsntExist(){
        //arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(false);
        when(authManager.authenticate(any())).thenReturn(authentication);

        //act
        CustomerService.Result result = customerService.verify(customer);

        //assert
        assertEquals(new CustomerService.Result("fail", "fail",null), result);

    }


}