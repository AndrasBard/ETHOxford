const express = require("express");
const { request, gql } = require("graphql-request");

const app = express();
const port = 3000;

// Mina GraphQL API endpoint (Berkeley Testnet)
const MINA_NETWORK = "https://proxy.berkeley.minaexplorer.com/graphql";

app.use(express.json());

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
