const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get("/", auth, (req, res) => {
  const accounts = db.get("accounts").value();
  return res.status(200).json({ status: "success", count: accounts.length, data: accounts });
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}/balance:
 *   get:
 *     summary: Get balance for an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         example: ACC001
 *     responses:
 *       200:
 *         description: Account balance
 *       404:
 *         description: Account not found
 */
router.get("/:accountId/balance", auth, (req, res) => {
  const account = db.get("accounts").find({ id: req.params.accountId }).value();

  if (!account) {
    return res.status(404).json({ status: "error", code: "ACCOUNT_NOT_FOUND", message: `Account ${req.params.accountId} not found` });
  }

  return res.status(200).json({
    status: "success",
    data: { accountId: account.id, holder: account.name, balance: account.balance, currency: "INR", type: account.type, ifsc: account.ifsc, status: account.status, timestamp: new Date().toISOString() },
  });
});

module.exports = router;