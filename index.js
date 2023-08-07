const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL database configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stage'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// GET - Get all products
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving products from database:', err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

// GET - Get a specific product by ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error retrieving product from database:', err);
      res.status(500).json({ message: 'Internal server error' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// POST - Create a new product
app.post('/products', (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    res.status(400).json({ message: 'Name and price are required' });
  } else {
    const sql = 'INSERT INTO products (name, price) VALUES (?, ?)';
    db.query(sql, [name, price], (err, result) => {
      if (err) {
        console.error('Error inserting product into database:', err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        const newProductId = result.insertId;
        res.status(201).json({ id: newProductId, name, price });
      }
    });
  }
});

// PUT - Update a product by ID
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price } = req.body;
  const sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
  db.query(sql, [name, price, productId], (err, result) => {
    if (err) {
      console.error('Error updating product in database:', err);
      res.status(500).json({ message: 'Internal server error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.json({ id: productId, name, price });
    }
  });
});

// DELETE - Delete a product by ID
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product from database:', err);
      res.status(500).json({ message: 'Internal server error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.sendStatus(204);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
