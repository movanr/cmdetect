import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Auth routes (must be before express.json())
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON middleware after auth handler
app.use(express.json());


// Health check
app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "hasura-auth-server" });
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
