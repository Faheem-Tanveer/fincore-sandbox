const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const bcrypt = require("bcryptjs");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "../../db.json"));
const db = low(adapter);

db.defaults({
  users: [
    { id: "u1", username: "faheem", password: bcrypt.hashSync("password123", 10), name: "Faheem A." },
    { id: "u2", username: "admin", password: bcrypt.hashSync("admin123", 10), name: "Admin User" },
  ],
  accounts: [
    { id: "ACC001", name: "Faheem A.", balance: 84230.50, type: "Savings", ifsc: "FINC0001234", status: "ACTIVE" },
    { id: "ACC002", name: "Priya Nair", balance: 12400.00, type: "Current", ifsc: "FINC0001234", status: "ACTIVE" },
    { id: "ACC003", name: "Karan Mehta", balance: 31750.75, type: "Savings", ifsc: "HDFC0005678", status: "ACTIVE" },
  ],
  transactions: [
    { id: "TXN8821", fromAccount: "ACC001", toAccount: "ACC002", amount: 2000, currency: "INR", note: "Rent split", status: "SUCCESS", createdAt: "2026-04-20T10:14:00.000Z" },
    { id: "TXN8815", fromAccount: "ACC003", toAccount: "ACC001", amount: 500, currency: "INR", note: "Lunch", status: "SUCCESS", createdAt: "2026-04-18T15:32:00.000Z" },
    { id: "TXN8799", fromAccount: "ACC002", toAccount: "ACC003", amount: 10000, currency: "INR", note: "Insufficient funds", status: "FAILED", createdAt: "2026-04-15T09:05:00.000Z" },
  ],
}).write();

module.exports = db;