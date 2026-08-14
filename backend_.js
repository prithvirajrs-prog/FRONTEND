const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. DASHBOARD OVERVIEW & METRICS
// ==========================================
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const metrics = await prisma.kPI.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KPI metrics' });
  }
});

// ==========================================
// 2. LIVE COMMODITY MARKET RATES
// ==========================================
app.get('/api/market/live-rates', async (req, res) => {
  try {
    const rates = await prisma.commodityRate.findMany();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market rates' });
  }
});

// ==========================================
// 3. CROP PRICE TRENDS (CHART DATA)
// ==========================================
app.get('/api/market/trends', async (req, res) => {
  const { crop } = req.query; // Filters e.g., ?crop=Wheat
  try {
    const filter = crop ? { cropName: { equals: crop, mode: 'insensitive' } } : {};
    const trends = await prisma.priceTrend.findMany({
      where: filter
    });
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
});

// ==========================================
// 4. TRANSACTIONS
// ==========================================

// Get recent transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create a new order/transaction
app.post('/api/transactions', async (req, res) => {
  const { orderId, buyer, cropType, quantityKg, totalAmount, status } = req.body;
  try {
    const newTransaction = await prisma.transaction.create({
      data: {
        orderId,
        buyer,
        cropType,
        quantityKg: parseFloat(quantityKg),
        totalAmount: parseFloat(totalAmount),
        status
      }
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: 'Could not create transaction', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AgriMarket Server listening on port ${PORT}`);
});