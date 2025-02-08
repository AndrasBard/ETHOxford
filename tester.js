const axios = require("axios");

const { PrivateKey } = require("o1js");

// Generate a new private key
const privateKey = PrivateKey.random();
console.log("Private Key:", privateKey.toBase58());

// Derive the corresponding public key
const publicKey = privateKey.toPublicKey();
console.log("Public Key:", publicKey.toBase58());

const BASE_URL = "http://localhost:3000";

async function testEndpoints() {
    try {
        // Test /balance/:address
        // const address = "B62qkwohsqTBPsvh5708mpVaNnpKp6i23LrmjtGzZWAq6nNxaK1EeGN";
        // const balanceResponse = await axios.get(`${BASE_URL}/balance/${address}`);
        // console.log("Balance Response:", balanceResponse.data);

        // Test /submit-paper
        const paperData = {
            title: "Blockchain Research Paper",
            hash: "abc123def456",
            authorPrivateKey: privateKey
        };
        const submitResponse = await axios.post(`${BASE_URL}/submit-paper`, paperData, {
            headers: {
                "Content-Type": "application/json"
            }});
        console.log("Submit Paper Response:", submitResponse.data);

        // Test /verify-paper
        const verifyData = {
            title: "Blockchain Research Paper",
            hash: "abc123def456",
            authorPublicKey: publicKey,
            signature: submitResponse.data.signature
        };
        const verifyResponse = await axios.post(`${BASE_URL}/verify-paper`, verifyData);
        console.log("Verify Paper Response:", verifyResponse.data);
    } catch (error) {
        console.error("Error testing endpoints:", error.response ? error.response.data : error.message);
    }
}

testEndpoints();
