const express = require("express");
const { PrivateKey, PublicKey, Signature, Field } = require("o1js");


const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"))
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// Store signed papers (for demonstration purposes, should be decentralized storage in production)
const papers = {};

// Get account balance (placeholder, as o1js does not directly handle network requests)
app.get("/balance/:address", async (req, res) => {
    try {
        const address = req.params.address;
        // In a real application, you would query the Mina network for the balance
        // This is a placeholder response
        res.json({ balance: "1000" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sign and store research paper metadata
app.post("/submit-paper", (req, res) => {
    try {
        const { title, hash, authorPrivateKey } = req.body;

        // Convert private key to a PrivateKey object
        const privateKey = PrivateKey.fromBase58(authorPrivateKey);

        // Derive the public key
        const authorPublicKey = privateKey.toPublicKey();

        // Create a message to sign (combine title and hash)
        const message = Field.fromJSON([title, hash]);

        // Sign the message
        const signature = Signature.create(privateKey, [message]);
        
        // Store the paper metadata
        papers[hash] = { title, authorPublicKey: authorPublicKey.toBase58(), signature: signature.toBase58() };
        
        res.json({ message: "Paper submitted!", signature: signature.toBase58() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify a paper's authenticity
app.post("/verify-paper", (req, res) => {
    try {
        const { title, hash, authorPublicKey, signature } = req.body;
        
        // Convert public key and signature to their respective objects
        const publicKey = PublicKey.fromBase58(authorPublicKey);
        const sig = Signature.fromBase58(signature);
        
        console.log(sig)
        // Create the message to verify
        const message = Field.fromJSON([title, hash]);
        
        // Verify the signature
        const isValid = sig.verify(publicKey, [message]);

        res.json({ isValid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
