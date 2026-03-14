package com.example.BankApi.service;

import com.example.BankApi.model.Currency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.annotation.Bean;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CurrencyServiceTest {

    CurrencyService currencyService;

    @BeforeEach
    void setUp() {
        currencyService = new CurrencyService();

    }

    @Test
    @Disabled("Requires real API connection")
    void convert_WhenAmountIsPositive() throws IOException, InterruptedException {
        //arrange
        double amount = 100;
        Currency currencyFrom = Currency.PLN;
        Currency currencyTo = Currency.USD;

        //act
        double result = currencyService.convert(amount, currencyFrom, currencyTo);

        //assert
        assertNotEquals(100, result);

    }

    @Test
    void convert_WhenAmountIsNegative() throws IOException, InterruptedException {
        //arrange
        double amount = -100;

        //assert
        assertThrows(IllegalArgumentException.class, () -> currencyService.convert(amount, Currency.PLN, Currency.USD));
    }

    @Test
    void convert_WhenCurrencyIsSame() throws IOException, InterruptedException {
        //arrange
        Currency currencyFrom = Currency.PLN;
        Currency currencyTo = Currency.PLN;
        double amount = 100;

        //act
        double result = currencyService.convert(amount, currencyFrom, currencyTo);

        //assert
        assertEquals(100, result);
    }
}