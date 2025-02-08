import express from "express";
import { Mina, PrivateKey, PublicKey, Signature, Field } from "o1js";
import { Level } from "level";
import { Request, Response } from "express";
import multer from "multer";

const app = express();
const port = 3000;

app.use(express.static(__dirname + "/../public"));
app.use(express.json());

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store the file in memory as a buffer
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

declare global {
  interface String {
    hashCode(): number;
  }
}

declare global {
    namespace Express {
      interface Request {
        file?: Express.Multer.File;
      }
    }
  }

String.prototype.hashCode = function (): number {
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
    const hashField = Field.from(JSON.stringify(`${title}${hash}`).hashCode());
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

// Route to upload and store PDFs
app.post("/upload-pdf", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const pdfBuffer = req.file?.buffer;

    if (!title || !pdfBuffer) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    // Convert the PDF buffer to a base64 string for storage
    const pdfBase64 = pdfBuffer.toString("base64");

    // Store PDF in the database
    await db.put(`pdf-${title}`, JSON.stringify({ title, pdfBase64 }));

    res.json({ success: true, title });
  } catch (error) {
    console.error("Upload error:", error);
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

// Route to retrieve PDFs
app.get("/pdf/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const paper = JSON.parse(await db.get(`pdf-${title}`));
    const pdfBase64 = paper.pdfBase64;

    if (!pdfBase64) {
      res.status(404).json({ success: false, error: "PDF not found" });
      return;
    }

    // Convert the base64 string back to a buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Set the appropriate headers for the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${title}.pdf`);

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Retrieval error:", error);
    res.status(404).json({ success: false, error: "PDF not found" });
  }
});

// Route to validate a paper
app.post("/validate-paper", async (req: Request, res: Response) => {
  try {
    const { title, publicKeyHex, signature } = req.body;

    if (!title || !publicKeyHex || !signature) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const paper = await db.get(title);
    const publicKey = PublicKey.fromBase58(publicKeyHex);
    const signatureObj = Signature.fromJSON(signature);
    const paperObj = JSON.parse(paper); // Assuming paper is retrieved as a string from the database
    const hashField = Field.from(JSON.stringify(`${paperObj.title}${paperObj.hash}`).hashCode());


    const isValid = signatureObj.verify(publicKey, [hashField]).toBoolean();

    res.json({ success: true, isValid });
  } catch (error) {
    console.error("Validation error:", error);
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errMessage });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
