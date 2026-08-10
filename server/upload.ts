import path from "path";
import express, { Request, Response } from "express";
import multer from "multer";
import { authenticateToken } from "./jwt.js";
import { supabase, BUCKET_NAME } from "./supabase.js";

// Configure memory storage for multer
const storage = multer.memoryStorage();

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
router.post("/", authenticateToken, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = fileName; // Upload to root of bucket or a subfolder if desired

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return res.status(200).json({ imageUrl: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image to Supabase" });
  }
});

export default router;
