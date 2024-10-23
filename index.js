const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post('/api/send-otp', (req, res) => {
    const { country_code, mobile_number } = req.body;

    // Validate the mobile number
    if (!mobile_number) {
        return res.status(400).json({ success: false, message: "Mobile number is invalid" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP

    // Insert OTP into the otps table
    const query = `INSERT INTO otps (mobile_number, otp) VALUES (?, ?)`;
    db.query(query, [mobile_number, otp], (err, result) => {
        if (err) throw err;
        return res.status(200).json({ success: true, message: "OTP sent successfully", otp: otp }); // Mock OTP display
    });
});

app.post('/api/verify-otp', (req, res) => {
    const { mobile_number, otp } = req.body;

    // Check if OTP is correct
    const query = `SELECT * FROM otps WHERE mobile_number = ? AND otp = ? ORDER BY created_at DESC LIMIT 1`;
    db.query(query, [mobile_number, otp], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Delete the OTP from the database
        db.query(`DELETE FROM otps WHERE mobile_number = ?`, [mobile_number]);

        // Generate JWT tokens
        const accessToken = jwt.sign({ mobile_number }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ mobile_number }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Store tokens in users table
        db.query(`UPDATE users SET access_token = ?, refresh_token = ? WHERE mobile_number = ?`, 
        [accessToken, refreshToken, mobile_number]);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            access_token: accessToken,
            refresh_token: refreshToken
        });
    });
});

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        req.user = user;
        next();
    });
};

app.post('/api/profile', authenticateJWT, (req, res) => {
    const { name, email, company, city } = req.body;
    const mobile_number = req.user.mobile_number;

    const query = `UPDATE users SET name = ?, email = ?, company = ?, city = ? WHERE mobile_number = ?`;
    db.query(query, [name, email, company, city, mobile_number], (err, result) => {
        if (err) throw err;
        return res.status(200).json({ success: true, message: "Profile created successfully" });
    });
});

app.get('/api/profile', authenticateJWT, (req, res) => {
    const mobile_number = req.user.mobile_number;

    const query = `SELECT name, email, company, city FROM users WHERE mobile_number = ?`;
    db.query(query, [mobile_number], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json(result[0]);
    });
});

app.post('/api/refresh-token', (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(403).json({ success: false, message: "Refresh token required" });
    }

    jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ mobile_number: user.mobile_number }, process.env.JWT_SECRET, { expiresIn: '15m' });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            access_token: accessToken
        });
    });
});
