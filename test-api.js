const axios = require("axios")
const { PrivateKey, PublicKey } = require("o1js");

const privateKey = PrivateKey.random();

// Derive the corresponding public key from the private key
const publicKey = privateKey.toPublicKey();

const API_URL = "http://localhost:3000"; // Update if running on a different port

const testAPI = async () => {
  try {
    console.log("🔹 Starting API Tests...");

    // Sample data
    const privateKeyHexA = privateKey.toBase58();
    const paperTitle = "Sample Research Paper";
    const paperHash = "123456789abcdef"; // Simulated hash

    // 🔸 Test: Sign a paper
    console.log("▶️ Signing paper...");
    let response = await axios.post(`${API_URL}/sign-paper`, {
      "privateKeyHex": privateKeyHexA,
      "title": paperTitle,
      "hash": paperHash,
    });

    console.log("✅ Signed paper response:", response.data);

    // 🔸 Test: Retrieve the paper
    console.log("▶️ Retrieving paper...");
    response = await axios.get(`${API_URL}/papers/${encodeURIComponent(paperTitle)}`);

    console.log("✅ Retrieved paper:", response.data);

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
};

// Run the tests
testAPI();
