# API Integration Tests Documentation

## Overview
This document outlines the integration test cases for the MentorMatch authentication endpoints.

---

## Register Endpoint

### Test Case 1: Successful Registration (Valid Data)

**Request:** POST `/register` with all required parameters

**Expected Response:**
```json
{
    "message": "User succesfully created",
    "success": true,
    "data": {
        "id": 3,
        "name": "Emanuele",
        "surname": "Contini",
        "email": "test2@gmail.com",
        "password_hash": "$2b$10$uIaCguph3ZThaGV7.w1WBu7AhFxHt2GUN6J.W2jGpLVwbgbHfaI6S",
        "role": "mentor",
        "bio": "Great mentor with years of experience",
        "photo_url": "https://www.youtube.com/@SynergoAltrocinema/posts.jpg",
        "created_at": "2025-12-22T16:45:42.095Z"
    }
}
```

**HTTP Status:** `201 Created`

---

### Test Case 2: Missing Required Parameter

**Request:** POST `/register` without required field (e.g., `email`)

**Expected Response:**
```json
{
    "success": false,
    "error": {
        "message": "Incorrect request",
        "details": [
            {
                "status": 400,
                "message": "Missing email"
            }
        ]
    }
}
```

**HTTP Status:** `400 Bad Request`

---

### Test Case 3: Invalid Parameter Format

**Request:** POST `/register` with incorrectly formatted optional field (e.g., invalid `photo_url` pattern)

**Expected Response:**
```json
{
    "success": false,
    "error": {
        "message": "Incorrect request",
        "details": [
            {
                "status": 400,
                "message": "Wrong pattern in photo_url"
            }
        ]
    }
}
```

**HTTP Status:** `400 Bad Request`

---

## Login Endpoint

### Test Case 1: Successful Login (Valid Credentials)

**Request:** POST `/login` with correct email and password for an existing user

**Expected Response:**
```json
{
    "message": "Login succesful",
    "success": true,
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY2Mzk5NTkyLCJleHAiOjE3NjY0MDMxOTJ9.nQy9L5mCvu9kHxM4M2iG56ryV5rb43RKtf-LMwshcbw"
}
```

**HTTP Status:** `200 OK`

---

### Test Case 2: Unregistered Email

**Request:** POST `/login` with an email address not registered in the database

**Expected Response:**
```json
{
    "success": false,
    "error": {
        "message": "Email is not registered",
        "details": "Email is not registered"
    }
}
```

**HTTP Status:** `400 Bad Request`

---

### Test Case 3: Invalid Password

**Request:** POST `/login` with correct email but incorrect password

**Expected Response:**
```json
{
    "success": false,
    "error": {
        "message": "Invalid password",
        "details": "Invalid password"
    }
}
```

**HTTP Status:** `400 Bad Request`

---

## Summary

All test cases have been validated against the current API implementation. The authentication endpoints correctly handle both successful operations and error scenarios with appropriate HTTP status codes and descriptive error messages.