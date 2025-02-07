const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
    console.log('Server started');
});

import { Mina, PrivateKey, AccountUpdate, ZkProgram } from "snarkyjs";

// Initialize SnarkyJS
await Mina.setActiveInstance(Mina.LocalBlockchain());

// Define a simple zero-knowledge program for proof generation
const PaperProof = ZkProgram({
  name: "PaperProof",
  publicInput: String,
  methods: {
    verifyPaper: {
      privateInputs: [String],
      async method(input, content) {
        // Simple equality check (replace with real ZKP logic)
        if (input !== content) throw new Error("Proof validation failed");
      },
    },
  },
});

await PaperProof.compile();

// Define a class for research papers
class Paper {
  constructor(title, author, content, references, date) {
    this.title = title;
    this.author = author;
    this.content = content;
    this.references = references;
    this.date = date;
  }

  async submitPaper() {
    // Generate a zero-knowledge proof
    const proof = await PaperProof.verifyPaper(this.content, this.content);

    // Create a transaction to deploy the paper to Mina
    const feePayerKey = PrivateKey.random();
    const tx = await Mina.transaction(feePayerKey, async () => {
      let update = AccountUpdate.createSigned(feePayerKey);
      update.body.memo = `Paper: ${this.title} by ${this.author}`;
    });

    await tx.prove();
    await tx.send();

    return tx.toPretty();
  }
}

// Example usage
async function main() {
  const paper = new Paper(
    "Decentralized Innovation in Research",
    "John Doe",
    "This paper explores the potential of blockchain in research...",
    ["Ref1", "Ref2", "Ref3"],
    new Date().toISOString()
  );

  const result = await paper.submitPaper();
  console.log(`Paper deployed successfully: ${result}`);
}

main().catch(console.error);
