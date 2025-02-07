const express = require("express");
const { request, gql } = require("graphql-request");
const MinaSigner = require("mina-signer").default;

const app = express();
const port = 3000;
const signer = MinaSigner;

const MINA_NETWORK = "https://proxy.berkeley.minaexplorer.com/graphql";

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// Store signed papers (for demonstration purposes, should be decentralized storage in production)
const papers = {};

// GraphQL query to get account balance
const GET_ACCOUNT_BALANCE = gql`
  query ($publicKey: String!) {
    account(publicKey: $publicKey) {
      balance { total }
    }
  }
`;

// Get account balance
app.get("/balance/:address", async (req, res) => {
    try {
        const address = req.params.address;
        const data = await request(MINA_NETWORK, GET_ACCOUNT_BALANCE, { publicKey: address });
        if (!data.account) {
            return res.status(404).json({ error: "Account not found" });
        }
        res.json({ balance: data.account.balance.total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sign and store research paper metadata
app.post("/submit-paper", (req, res) => {
    try {
        const { title, hash, authorPrivateKey } = req.body;
        const authorPublicKey = signer.getPublicKey(authorPrivateKey);
        const signature = signer.sign(JSON.stringify({ title, hash }), authorPrivateKey);
        
        papers[hash] = { title, authorPublicKey, signature };
        
        res.json({ message: "Paper submitted!", signature });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify a paper's authenticity
app.post("/verify-paper", (req, res) => {
    try {
        const { title, hash, authorPublicKey, signature } = req.body;
        const isValid = signer.verify(signature, JSON.stringify({ title, hash }), authorPublicKey);
        res.json({ isValid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
