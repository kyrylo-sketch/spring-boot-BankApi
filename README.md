# BankApi

## Description

A backend for full-stack application built with Java Spring Boot, React and PostgreSQL.

**Live Demo:** [bank-frontend-bay.vercel.app](https://bank-frontend-bay.vercel.app)
**API Docs:** [Swagger UI](https://spring-boot-bankapi-production.up.railway.app/swagger-ui/index.html)


## Features

- JWT authentication with refresh token
- Division of users into role(USER/ADMIN)
- Password encryption with BCrypt
- Actual currency conversion (PLN, EUR, USD)
- Transaction history
- Admin panel for managing customer and account
- Division of account(Saving/Checking)
- Unit tests with JUnit and Mockito

## Tech Stack
- **Backend:** Java 21, Spring Boot Web, Spring Security, PostgreSQL, Hibernate
- **Testing:** JUnit 5, Mockito
- **Deployment:** Railway (backend)

## API Endpoints
| Method | URL                                   | Description                    |
|--------|---------------------------------------|--------------------------------|
| POST   | `/api/auth/register `                 | Register new user              |
| POST   | `/api/auth/login`                     | Login                          |
| POST   | `/api/auth/refresh`                   | Refresh token                  |
| GET    | `/api/accounts`                       | Get all accounts               |
| POST   | `/api/account/transaction`            | Make transaction               |
| PUT    | `/api/account/{id}/deposit/{amount}`  | Deposit                        |
| GET    | `/api/accounts/{id}`                  | Get account by id              |
| PUT    | `/api/account/{id}/withdraw/{amount}` | Withdraw                       |
| GET    | `/api/account/{id}/transactions`      | Get all transaction of account |
| GET    | `/api/customers`                      | Get all customers              |
| DELETE | `/api/customers/{id}`                 | Delete customer by id          |
| PUT    | `/api/customers`                      | Update customer                |
| PUT    | `/api/customers/{id}/account`         | Add account to customer by id  |

## Setup

```bash
git clone https://github.com/kyrylo-sketch/spring-boot-BankApi
cd BankApi
```
Add `application.properties`
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bankdb
spring.datasource.username=postgres
spring.datasource.password=yourpassword
jwt.secret=yoursecretKey
```

Run the application in IntelliJ or with:
```bash
mvn spring-boot:run
```