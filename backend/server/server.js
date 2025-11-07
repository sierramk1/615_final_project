import express from "express";
import multer from "multer";
import cors from "cors";
import * as math from "mathjs";
import bisectionRouter from "./routes/bisection.js";
import goldenSearchRouter from "./routes/goldenSearch.js";
import newtonRaphsonRouter from "./routes/newtonRaphson.js";
import secantRouter from "./routes/secant.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/optimize", bisectionRouter);
app.use("/api/optimize", goldenSearchRouter);
app.use("/api/optimize", newtonRaphsonRouter);
app.use("/api/optimize", secantRouter);

const upload = multer({ storage: multer.memoryStorage() });

let uploadedData = null;

// 1) Receive data file
app.post("/upload-data", upload.single("file"), (req, res) => {
  const csv = req.file.buffer.toString();
  const rows = csv.split("\n").map(r => r.split(",").map(Number));
  uploadedData = rows;
  res.json({ status: "ok", rows: uploadedData.length });
});

// 2) Interpolate f(x) when user requests evaluation
app.post("/evaluate", (req, res) => {
  const { x } = req.body;
  if (!uploadedData) return res.status(400).json({ error: "No data uploaded" });

  // Simple linear interpolation:
  let closest = uploadedData.reduce((prev, curr) =>
    Math.abs(curr[0] - x) < Math.abs(prev[0] - x) ? curr : prev
  );

  res.json({ y: closest[1] });
});

app.listen(8000, () => console.log("Server running on port 8000"));