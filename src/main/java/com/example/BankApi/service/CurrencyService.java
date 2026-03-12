package com.example.BankApi.service;

import com.example.BankApi.model.Currency;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class CurrencyService {
    private final String apiKey = "76ef01d79136b055e827a5cd041468f4";
    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();


    public CurrencyService(){}

    public double convert(double amount, Currency from, Currency to) throws IOException, InterruptedException {
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
        return amount * (rateTo / rateFrom);
    }

//    public double getEur() throws IOException, InterruptedException {
//        ObjectMapper mapper = new ObjectMapper();
//        JsonNode node = mapper.readTree(response.body());
//
//        double eur = node.get("rates").get("EUR").asDouble();
//        return eur;
//    }
//
//    public double getUSD() throws IOException, InterruptedException {
//        ObjectMapper mapper = new ObjectMapper();
//        JsonNode node = mapper.readTree(response.body());
//
//        double usd = node.get("rates").get("USD").asDouble();
//        return usd;
//    }
//
//    public double getPln() throws IOException, InterruptedException {
//        ObjectMapper mapper = new ObjectMapper();
//        JsonNode node = mapper.readTree(response.body());
//
//        double pln = node.get("rates").get("PLN").asDouble();
//        return pln;
//    }

}
