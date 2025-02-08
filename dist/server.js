"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const o1js_1 = require("o1js");
const level_1 = require("level");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.static(__dirname + "/../public"));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
// POST: Sign an academic paper
const db = new level_1.Level("./papers-db", { valueEncoding: "json" });
// Route to sign academic paper hashes
app.post("/sign-paper", async (req, res) => {
    try {
        const { privateKeyHex, title, hash } = req.body;
        if (!privateKeyHex || !title || !hash) {
            res.status(400).json({ success: false, error: "Missing required fields" });
            return;
        }
        const privateKey = o1js_1.PrivateKey.fromBase58(privateKeyHex);
        const hashField = o1js_1.Field.from(JSON.stringify(`${title}${hash}`).hashCode());
        const signature = o1js_1.Signature.create(privateKey, [hashField]);
        // Store signed paper
        await db.put(title, JSON.stringify({ title, hash, signature: signature.toJSON() }));
        res.json({ success: true, title, signature: signature.toJSON() });
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Retrieval error:", error);
        res.status(404).json({ success: false, error: "Paper not found" });
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
