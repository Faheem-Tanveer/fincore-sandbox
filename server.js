require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const authRoutes = require("./src/routes/auth");
const accountRoutes = require("./src/routes/accounts");
const transferRoutes = require("./src/routes/transfers");
const transactionRoutes = require("./src/routes/transactions");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Fincore API Docs",
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transfers", transferRoutes);
app.use("/api/v1/transactions", transactionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Fincore Banking Sandbox", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ status: "error", code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`\n🏦 Fincore Banking Sandbox running`);
  console.log(`   API:  http://localhost:${PORT}/api/v1`);
  console.log(`   Docs: http://localhost:${PORT}/api/docs`);
  console.log(`\n   username: faheem  | password: password123`);
  console.log(`   username: admin   | password: admin123\n`);
});