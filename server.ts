import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from "xlsx";
import { FeedbackRecord, AnonymousMessage, DocumentFormData } from "./src/types";

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

// Initial seed data
const DEFAULT_FEEDBACKS: FeedbackRecord[] = [
  {
    id: 1,
    academic_year: "Year 3",
    location: "On Campus",
    problem_description: "The main clinical lecture hall has poor air conditioning, making it difficult to concentrate during afternoon pathology sessions.",
    solution_suggestion: "Upgrade or service the auxiliary split unit AC in Lecture Room B.",
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 2,
    academic_year: "Year 1",
    location: "Off Campus",
    problem_description: "Study areas near the college main portal lack enough power outlets for students with laptops waiting between lectures.",
    solution_suggestion: "Install a multi-socket charging tree or station in the central courtyard lobby.",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const DEFAULT_MESSAGES: AnonymousMessage[] = [
  {
    id: 1,
    content: "Hey, thanks for building VLX Tools! The PDF template feature is absolutely saving lives.",
    phoneNumber: "+2348000000000",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 2,
    content: "Are there plans to release the Bookshop feature soon? Looking forward to AI-powered study aids.",
    phoneNumber: null,
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

// Helper to load and save local database file
interface LocalDB {
  feedback: FeedbackRecord[];
  messages: AnonymousMessage[];
  docTemplates: { [key: string]: { styleName: string; html: string }[] };
}

function loadDB(): LocalDB {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading local database, resetting:", error);
  }
  const initial = { feedback: DEFAULT_FEEDBACKS, messages: DEFAULT_MESSAGES, docTemplates: {} };
  saveDB(initial);
  return initial;
}

function saveDB(db: LocalDB): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving local database:", error);
  }
}

// Lazy-loaded Gemini AI client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in AI Studio Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "VLX Tools backend is running" });
  });

  // API Route - Get Feedback List
  app.get("/api/feedback", (req, res) => {
    const db = loadDB();
    res.json(db.feedback);
  });

  // API Route - Submit Feedback
  app.post("/api/feedback", (req, res) => {
    const { academic_year, location, problem_description, solution_suggestion } = req.body;
    if (!academic_year || !location || !problem_description) {
      return res.status(400).json({ error: "Academic year, location, and problem description are required." });
    }

    const db = loadDB();
    const newRecord: FeedbackRecord = {
      id: db.feedback.length > 0 ? Math.max(...db.feedback.map((f) => f.id)) + 1 : 1,
      academic_year,
      location,
      problem_description,
      solution_suggestion: solution_suggestion || "",
      timestamp: new Date().toISOString(),
    };

    db.feedback.unshift(newRecord); // Prepend so most recent is first
    saveDB(db);

    console.log(`[Timestamp: ${new Date().toISOString()}, Feedback status: successful]`);
    res.json({ response: "successful", record: newRecord });
  });

  // API Route - Get Anonymous Messages (Vicade's Inbox)
  app.get("/api/messages", (req, res) => {
    const db = loadDB();
    res.json(db.messages);
  });

  // API Route - Submit Anonymous Message
  app.post("/api/messages", (req, res) => {
    const { content, phoneNumber } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Message content is required." });
    }

    const db = loadDB();
    const newMessage: AnonymousMessage = {
      id: db.messages.length > 0 ? Math.max(...db.messages.map((m) => m.id)) + 1 : 1,
      content,
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString(),
    };

    db.messages.unshift(newMessage);
    saveDB(db);

    res.json({ response: "successful", message: newMessage });
  });

  // API Route - AI-Powered Excel Maker (Parse raw data into spreadsheet)
  app.post("/api/excel-parse", async (req, res) => {
    const { data, prompt } = req.body;
    if (!data || !prompt) {
      return res.status(400).json({ error: "Raw data and column prompt are required." });
    }

    try {
      const ai = getAIClient();

      // System Instructions instructing Gemini to act as a raw CSV structure generator
      const metaPrompt = `Act as a professional data parser. The accompanying raw data includes the final desired CSV header row or descriptive guidance on the columns. Parse the rest of the unstructured text line-by-line, extracting and structuring it to fit those specified columns.

Your response MUST be ONLY the raw CSV text.
Start directly with the CSV header row on the first line. Do not wrap the output in markdown backticks (such as \`\`\`csv or \`\`\`), do not provide any introduction, explanation, or conversational commentary. Ensure every line corresponds to a parsed record. Use standard commas to separate fields, and wrap values containing commas in double quotes.

Desired structure/prompt guidance:
"${prompt}"

Raw unstructured input data:
"${data}"`;

      console.log("Parsing Excel data via Gemini...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: metaPrompt,
      });

      const csvText = response.text || "";
      if (!csvText.trim()) {
        throw new Error("No data was parsed by the model.");
      }

      // Simple CSV parsing into 2D Array for SheetJS (xlsx)
      const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const rows: string[][] = [];

      for (const line of lines) {
        // Simple comma splitting that accounts for basic quoted commas
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
        const parsedRow = matches.map((val) => {
          let clean = val.trim();
          if (clean.startsWith('"') && clean.endsWith('"')) {
            clean = clean.slice(1, -1);
          }
          return clean;
        });
        rows.push(parsedRow);
      }

      if (rows.length === 0) {
        throw new Error("Failed to parse output CSV lines.");
      }

      // Construct a real Excel file with SheetJS
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Parsed Data");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      // Generate a nice filename
      const safeName = prompt.slice(0, 20).replace(/[^a-z0-9]/gi, "_").toLowerCase() || "data_export";
      const filename = `vlx_${safeName}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Excel Parser Gemini Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during AI spreadsheet parsing." });
    }
  });

  // API Route - PDF Document Generator (AI Templates creator)
  app.post("/api/pdf-generate", async (req, res) => {
    const formData: DocumentFormData = req.body;
    if (!formData || !formData.document_type) {
      return res.status(400).json({ error: "Document type is required." });
    }

    try {
      const ai = getAIClient();

      // Stringify form values to feed into Gemini
      const dataDetails = Object.entries(formData)
        .filter(([key]) => key !== "document_type")
        .map(([key, val]) => `${key.replace(/^[a-z]+_/gi, "").toUpperCase()}: ${val}`)
        .join("\n");

      const docTypeLabel = formData.document_type.toUpperCase();

      const aiPrompt = `You are an expert desktop publisher and senior front-end UI designer.
Your task is to generate exactly three distinct visual styling templates as high-fidelity self-contained HTML documents for a professional "${docTypeLabel}" based on the user-provided info below.

For each of the three templates:
- It MUST be a complete, self-contained HTML page with robust CSS inside a <style> block.
- It MUST have professional desktop-publisher typography, layout structure, letterhead, headers, margins, borders, signature blocks, and perfect table formatting if needed.
- It MUST look like a high-fidelity document when rendered in an A4 container or when printed.
- Add "Powered by VLX Tools" and "Made with TechLite" beautifully positioned at the footer of the document in a subtle, elegant way.
- DO NOT use any markdown backticks inside the HTML.
- The 3 layouts should have distinct visual vibes:
  1. "Executive Professional": Sleek, formal, dark navy/slate accents, traditional corporate letterhead layout.
  2. "Creative Modern": Contemporary, subtle colored dividers (e.g. elegant charcoal and teal), asymmetric margins, stylish header card.
  3. "Minimalist Editorial": High-contrast, classic serif typography pairings, spacious tracking, elegant subtle borders.

Return your response in strict JSON matching this schema:
{
  "templates": [
    {
      "styleName": "Executive Professional",
      "html": "...Complete self-contained HTML document string..."
    },
    {
      "styleName": "Creative Modern",
      "html": "...Complete self-contained HTML document string..."
    },
    {
      "styleName": "Minimalist Editorial",
      "html": "...Complete self-contained HTML document string..."
    }
  ]
}

Input fields provided by the user for the "${docTypeLabel}" layout:
${dataDetails}`;

      console.log(`Generating 3 custom design templates for ${formData.document_type}...`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: aiPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              templates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleName: { type: Type.STRING },
                    html: { type: Type.STRING },
                  },
                  required: ["styleName", "html"],
                },
              },
            },
            required: ["templates"],
          },
        },
      });

      const parsedJSON = JSON.parse(response.text || "{}");
      if (!parsedJSON.templates || !Array.isArray(parsedJSON.templates) || parsedJSON.templates.length === 0) {
        throw new Error("No templates generated from the AI model.");
      }

      // Generate a unique token key for this document batch
      const docKey = Math.random().toString(36).slice(2, 10);
      const db = loadDB();
      db.docTemplates[docKey] = parsedJSON.templates;
      saveDB(db);

      res.json({
        response: "successful",
        key: docKey,
        templates: parsedJSON.templates.map((tpl: any, idx: number) => ({
          styleName: tpl.styleName,
          subkey: idx,
        })),
      });
    } catch (error: any) {
      console.error("AI PDF Generation Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during template creation." });
    }
  });

  // API Route - Get Document Templates by Key
  app.get("/api/doc-templates/:key", (req, res) => {
    const { key } = req.params;
    const db = loadDB();
    const templates = db.docTemplates[key];
    if (!templates) {
      return res.status(404).json({ error: "Document batch expired or not found. Please generate new docs." });
    }
    res.json({ key, templates });
  });

  // Integrate Vite Dev Server in Non-Production environments
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled UI assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
