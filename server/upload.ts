import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express, { Request, Response } from "express";
import { authenticateToken } from "./jwt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, "..", "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, PNG, WEBP) are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/upload – upload an image (requires auth)
// ---------------------------------------------------------------------------
router.post("/", authenticateToken, upload.single("image"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the relative URL to the image
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
