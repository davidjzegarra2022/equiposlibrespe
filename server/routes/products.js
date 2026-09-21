const express = require('express');
const store = require('../store');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: full catalog with live prices
router.get('/products', (req, res) => {
  res.json(store.getCatalog());
});

// Admin only: update a product's price
router.patch('/admin/products/:id/price', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { price } = req.body || {};

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: 'El precio debe ser un numero valido mayor o igual a 0.' });
  }

  const updated = await store.updateProductPrice(id, numericPrice);
  if (!updated) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  res.json({ ok: true, product: updated });
});

// Admin only: toggle stock availability
router.patch('/admin/products/:id/stock', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body || {};

  const updated = await store.updateProductStock(id, Boolean(stock));
  if (!updated) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  res.json({ ok: true, product: updated });
});

module.exports = router;
