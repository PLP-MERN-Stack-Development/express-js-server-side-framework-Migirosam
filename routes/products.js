// routes/products.js

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const products = require('../data/productsData');
const auth = require('../middleware/auth');
const validateProduct = require('../middleware/validateProduct');
const { NotFoundError } = require('../utils/customErrors');

const router = express.Router();

// ✅ GET /api/products - List all products (with filtering & pagination)
router.get('/', (req, res) => {
  const { category, page = 1, limit = 5 } = req.query;
  let filtered = products;

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));

  res.json({
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginated,
  });
});

// ✅ GET /api/products/:id - Get a specific product
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

// ✅ POST /api/products - Create new product
router.post('/', auth, validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ✅ PUT /api/products/:id - Update a product
router.put('/:id', auth, validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// ✅ DELETE /api/products/:id - Delete a product
router.delete('/:id', auth, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// ✅ Advanced Routes

// Search by name
router.get('/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'Search query missing' });

  const results = products.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  res.json(results);
});

// Product stats
router.get('/stats', (req, res) => {
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

module.exports = router;
