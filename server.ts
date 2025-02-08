import express from "express";
import { Mina, PrivateKey, PublicKey, Signature, Field } from "o1js";
import { Level } from "level";
import { Request, Response } from "express";

const app = express();
const port = 3000;


app.use(express.static(__dirname + "/../public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

declare global {
    interface String {
      hashCode(): number;
    }
  }
  
String.prototype.hashCode = function(): number {
let hash = 0;
for (let i = 0; i < this.length; i++) {
    const chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
}
return hash;
};

// POST: Sign an academic paper
const db = new Level("./papers-db", { valueEncoding: "json" });

// Route to sign academic paper hashes
app.post("/sign-paper", async (req: Request, res: Response): Promise<void> => {
  try {
    const { privateKeyHex, title, hash } = req.body;

    if (!privateKeyHex || !title || !hash) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const privateKey = PrivateKey.fromBase58(privateKeyHex);
    const hashField = Field.from(JSON.stringify(`${title}${hash}`).hashCode())
    const signature = Signature.create(privateKey, [hashField]);

    
    // Store signed paper
    await db.put(title, JSON.stringify({ title, hash, signature: signature.toJSON() }));


    res.json({ success: true, title, signature: signature.toJSON() });
  } catch (error) {
    console.error("Signing error:", error);
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errMessage });
  }
});

// Route to retrieve signed papers
app.get("/papers/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const paper = await db.get(title);

    res.json({ success: true, paper });
  } catch (error) {
    console.error("Retrieval error:", error);
    res.status(404).json({ success: false, error: "Paper not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
