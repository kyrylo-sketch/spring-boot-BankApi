package com.example.BankApi;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BankApiApplicationTests {
    @Test
    @Disabled("Requires database connection")
    void contextLoads() {}

}
