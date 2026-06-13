const fs = require("fs");
const FormData = require("form-data");
const http = require("http");

async function testGallery() {
    try {
        const { default: fetch } = await import("node-fetch");
        
        // 1. Login
        console.log("Logging in as Admin...");
        const loginRes = await fetch("http://127.0.0.1:5001/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "dishanailsacademy@gmail.com", password: "Hardik@0504" })
        });
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            throw new Error("Failed to get token: " + JSON.stringify(loginData));
        }
        
        const token = loginData.token;
        console.log("Login successful! Token received.");
        
        // 2. Upload file
        console.log("Uploading gallery item...");
        const form = new FormData();
        form.append("artistName", "Test Script Automation");
        form.append("image", fs.createReadStream("/Users/het2583/.gemini/antigravity/brain/e02a1935-51da-4ae6-ae57-8a5b6d13d10a/nail_art_1780153107160.png"));
        
        const uploadRes = await fetch("http://127.0.0.1:5001/api/gallery", {
            method: "POST",
            headers: {
                ...form.getHeaders(),
                "Authorization": `Bearer ${token}`
            },
            body: form
        });
        
        const uploadData = await uploadRes.json();
        console.log("Upload response:", uploadData);
        
        // 3. GET all gallery items
        const getRes = await fetch("http://127.0.0.1:5001/api/gallery");
        const getData = await getRes.json();
        console.log("Current Gallery items:", getData.length);
        
    } catch (e) {
        console.error("Error running test:", e);
    }
}
testGallery();
