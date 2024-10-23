# user-auth-profile-system
# User Authentication & Profile Management System

## Description
This project implements a simple user authentication system using Node.js and MySQL. The system supports JWT (JSON Web Tokens) for secure authentication, including OTP-based (One-Time Password) login and user profile management.

## Features
- **Send OTP:** Sends a 4-digit OTP to a specified mobile number (mock implementation).
- **Verify OTP:** Validates the OTP entered by the user and generates JWT access and refresh tokens.
- **Create User Profile:** Allows users to create and manage their profiles.
- **Get User Profile:** Enables users to retrieve their profile information securely.
- **Refresh Token:** Provides functionality to refresh access tokens using a valid refresh token.

## Technical Requirements
- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Framework for building web applications.
- **MySQL**: Relational database management system for storing user data.
- **JWT**: Method for securely transmitting information between parties as a JSON object.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Av-b16/user-auth-profile-system.git

2. Navigate to the project directory:
    cd your-repository-name
3.   Install dependencies:
    npm install

4. Set up MySQL Database:

    Create a MySQL database and tables as specified in the project.
    Use the following SQL commands to create the necessary tables:
    sql
    Copy code
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile_number VARCHAR(15) UNIQUE NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        company VARCHAR(100),
        city VARCHAR(50),
        access_token TEXT,
        refresh_token TEXT
    );

    CREATE TABLE otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile_number VARCHAR(15) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

5. Configure Environment Variables:

    Create a .env file in the root of the project and set your database connection string and other environment variables:
    makefile
    
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASS=your_db_password
    DB_NAME=your_database_name
    PORT=3000

Running the Application
1. Start the server:

    node index.js
2. The server will run on http://localhost:3000.

API Endpoints
1. Send OTP

Endpoint: /api/send-otp
Method: POST
Request Body:
json

{
    "country_code": "+1",
    "mobile_number": "1234567890"
}
Response:
Success: { "success": true, "message": "OTP sent successfully" }
Error: { "success": false, "message": "Mobile number is invalid" }

2. Verify OTP

Endpoint: /api/verify-otp
Method: POST
Request Body:
json

{
    "mobile_number": "1234567890",
    "otp": "1234"
}
Response:
Success: { "success": true, "message": "OTP verified successfully", "access_token": "your-access-token", "refresh_token": "your-refresh-token" }
Error: { "success": false, "message": "Invalid OTP" }

3. Create Profile

Endpoint: /api/profile
Method: POST
Request Body:
json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "company": "Example Corp",
    "city": "New York"
}
Response:
Success: { "success": true, "message": "Profile created successfully" }
Error: { "success": false, "message": "Unauthorized" }

4. Get Profile

Endpoint: /api/profile
Method: GET
Response:
Success: { "name": "John Doe", "email": "john.doe@example.com", "company": "Example Corp", "city": "New York" }
Error: { "success": false, "message": "Unauthorized" }
Refresh Token

Endpoint: /api/refresh-token
Method: POST
Request Body:
json

{
    "refresh_token": "your-refresh-token"
}
Response:
Success: { "success": true, "message": "Token refreshed successfully", "access_token": "new-access-token" }
Testing the API
You can test the API endpoints using tools like Postman or cURL.

License
This project is licensed under the MIT License.

Author
Your Name - Av-b16









