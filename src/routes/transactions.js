const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get transaction logs
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED]
 *       - in: query
 *         name: account
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction list
 */
router.get("/", auth, (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const { status, account } = req.query;

  let txns = db.get("transactions").value();
  if (status) txns = txns.filter(t => t.status === status.toUpperCase());
  if (account) txns = txns.filter(t => t.fromAccount === account || t.toAccount === account);

  return res.status(200).json({ status: "success", count: txns.slice(0, limit).length, total: txns.length, data: txns.slice(0, limit) });
});

/**
 * @swagger
 * /api/v1/transactions/{txnId}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txnId
 *         required: true
 *         schema:
 *           type: string
 *         example: TXN8821
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Not found
 */
router.get("/:txnId", auth, (req, res) => {
  const txn = db.get("transactions").find({ id: req.params.txnId }).value();
  if (!txn) return res.status(404).json({ status: "error", code: "TXN_NOT_FOUND", message: `Transaction ${req.params.txnId} not found` });
  return res.status(200).json({ status: "success", data: txn });
});

module.exports = router;