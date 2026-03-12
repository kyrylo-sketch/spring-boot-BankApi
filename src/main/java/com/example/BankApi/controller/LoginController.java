package com.example.BankApi.controller;

import com.example.BankApi.model.Customer;
import com.example.BankApi.model.RefreshToken;
import com.example.BankApi.service.CustomerService;
import com.example.BankApi.service.JWTService;
import com.example.BankApi.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class LoginController {

    @Autowired
    CustomerService service;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    JWTService  jwtService;

    @RequestMapping("/greetLogin")
    public String greet(){
        return "Welcome to login!";
    }

    @PostMapping("/auth/login")
    public CustomerService.Result login(@RequestBody Customer customer){
        //return CustomerService.login(username, password);
        return service.verify(customer);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<String> register(@RequestBody Customer customer){
        return service.register(customer);
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String,String> body){
        String token = body.get("refreshToken");
        RefreshToken refreshToken = refreshTokenService.findByToken(token);
        if(refreshToken == null || !refreshTokenService.isValid(refreshToken)){
            return new ResponseEntity<>("Token invalid", HttpStatus.BAD_REQUEST);
        }
        else{
            String newAccessToken = jwtService.generateToken(refreshToken.getCustomer().getUsername());
            return new ResponseEntity<>(Map.of("accessToken", newAccessToken), HttpStatus.OK);
        }
    }


}
