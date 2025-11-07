import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload-data", upload.single("file"), (req, res) => {
  const raw = fs.readFileSync(req.file.path, "utf-8");

  const points = raw
    .trim()
    .split("\n")
    .map((line) => line.split(",").map(Number));

  return res.json({ points });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});

