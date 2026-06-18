\# NestJS Authentication & RBAC API

A secure authentication and authorization system built with **NestJS**, **MongoDB**, **JWT**, **Passport.js**, and **Role-Based Access Control (RBAC)**.

## Features

* User Registration & Login
* JWT Access Token Authentication
* Refresh Token Authentication
* Secure Logout
* Password Hashing with bcrypt
* Protected Routes using Guards
* Custom Decorators
* Role-Based Access Control (User, Admin, Moderator)
* Update Profile
* Change Password
* User Management APIs
* Search & Pagination
* MongoDB Integration with Mongoose

---

## Tech Stack

* NestJS
* TypeScript
* MongoDB
* Mongoose
* JWT
* Passport.js
* bcrypt
* class-validator

---

## Project Structure

```bash
src
├── auth
│   ├── decorators
│   ├── dto
│   ├── enums
│   ├── guards
│   ├── strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users
│   ├── dto
│   ├── schemas
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── app.module.ts
└── main.ts
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/nest-auth

PORT=3001

JWT_SECRET=your-jwt-secret

JWT_REFRESH_SECRET=your-refresh-secret
```

---

## Installation

```bash
git clone https://github.com/your-username/your-repository.git

cd your-repository

npm install
```

## Run Locally

```bash
npm run start:dev
```

Server runs on:

```bash
http://localhost:3001
```

---

## API Endpoints

### Authentication

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /auth/register        |
| POST   | /auth/login           |
| POST   | /auth/refresh         |
| POST   | /auth/logout          |
| GET    | /auth/profile         |
| PATCH  | /auth/change-password |

### User Management

| Method | Endpoint        | Access        |
| ------ | --------------- | ------------- |
| PATCH  | /users/profile  | Authenticated |
| GET    | /users          | Admin         |
| GET    | /users/:id      | Admin         |
| PATCH  | /users/:id/role | Admin         |
| DELETE | /users/:id      | Admin         |

---

## Authentication Flow

```text
Register
   ↓
Login
   ↓
Access Token + Refresh Token
   ↓
Protected Routes
   ↓
Refresh Access Token
   ↓
Logout
```

---

## RBAC Example

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get('users')
getAllUsers() {}
```

---

## Future Improvements

* Swagger Documentation
* Email Verification
* Password Reset
* Rate Limiting
* Unit & Integration Testing
* Docker Support

---

## Author

Pravin E

Backend Developer | NestJS | MongoDB | TypeScript
