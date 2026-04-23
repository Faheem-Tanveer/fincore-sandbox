const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/transfers:
 *   post:
 *     summary: Transfer funds between accounts
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAccount:
 *                 type: string
 *                 example: ACC001
 *               toAccount:
 *                 type: string
 *                 example: ACC002
 *               amount:
 *                 type: number
 *                 example: 1500
 *               note:
 *                 type: string
 *                 example: Monthly rent
 *     responses:
 *       201:
 *         description: Transfer successful
 *       422:
 *         description: Insufficient funds
 */
router.post("/", auth, (req, res) => {
  const { fromAccount, toAccount, amount, note = "", currency = "INR" } = req.body;

  if (!fromAccount || !toAccount || amount === undefined) {
    return res.status(400).json({ status: "error", code: "MISSING_FIELDS", message: "fromAccount, toAccount and amount are required" });
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ status: "error", code: "INVALID_AMOUNT", message: "Amount must be a positive number" });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({ status: "error", code: "SAME_ACCOUNT", message: "Source and destination cannot be the same" });
  }

  const sender = db.get("accounts").find({ id: fromAccount }).value();
  const receiver = db.get("accounts").find({ id: toAccount }).value();

  if (!sender) return res.status(404).json({ status: "error", code: "ACCOUNT_NOT_FOUND", message: `Account ${fromAccount} not found` });
  if (!receiver) return res.status(404).json({ status: "error", code: "ACCOUNT_NOT_FOUND", message: `Account ${toAccount} not found` });

  const txnId = "TXN" + Math.floor(Math.random() * 90000 + 10000);
  const timestamp = new Date().toISOString();

  if (sender.balance < amt) {
    db.get("transactions").unshift({ id: txnId, fromAccount, toAccount, amount: amt, currency, note, status: "FAILED", createdAt: timestamp }).write();
    return res.status(422).json({ status: "error", code: "INSUFFICIENT_FUNDS", message: `Insufficient balance. Available: ₹${sender.balance}`, data: { transactionId: txnId, status: "FAILED" } });
  }

  db.get("accounts").find({ id: fromAccount }).assign({ balance: parseFloat((sender.balance - amt).toFixed(2)) }).write();
  db.get("accounts").find({ id: toAccount }).assign({ balance: parseFloat((receiver.balance + amt).toFixed(2)) }).write();
  db.get("transactions").unshift({ id: txnId, fromAccount, toAccount, amount: amt, currency, note, status: "SUCCESS", createdAt: timestamp }).write();

  return res.status(201).json({
    status: "success",
    data: { transactionId: txnId, fromAccount, toAccount, amount: amt, currency, note, status: "SETTLED", timestamp },
  });
});

module.exports = router;