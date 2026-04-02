package com.example.BankApi.service;

import com.example.BankApi.model.Currency;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
public class CurrencyService {
    private final String apiKey = "76ef01d79136b055e827a5cd041468f4";
    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();


    public CurrencyService(){}

    public double convert(double amount, Currency from, Currency to) throws IOException, InterruptedException {
        log.info("Converting request from{} to{}, amount={}", from, to, amount);
        if (amount <=0){
            log.warn("Converting failed: negative amount={}", amount);
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        if(from == to){
            return amount;
        }
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.exchangeratesapi.io/v1/latest?access_key=" + apiKey))
                .GET()
                .build();
         HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode node = mapper.readTree(response.body());

        double rateFrom;
        if(from == Currency.EUR){
            rateFrom = 1;
        }else{
            rateFrom = node.get("rates").get(from.name()).asDouble();
        }
        double rateTo;
        if(to == Currency.EUR){
            rateTo = 1;
        }else {
            rateTo = node.get("rates").get(to.name()).asDouble();
        }
        log.info("Converting successful: from={}, to={}, amount={}", from, to, amount);
        return amount * (rateTo / rateFrom);
    }

}
