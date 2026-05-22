const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized", message: "Token expired or invalid" });
    }
    req.user = user;
    next();
  });
};


app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "ValidationError", message: "email n password are required" });
  }
  if (password.length < 6) {
    return res.status(422).json({ error: "ValidationError", message: "password too weak" });
  }
  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
     
      return res.status(422).json({ error: "ValidationError", message: "email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );
    const token = jwt.sign({ user_id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ success: true, message: "registered successfully", data: { user: newUser.rows[0], token } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
     
      return res.status(401).json({ message: "email atau password salah" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "email atau password salah" });
    }

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/v1/products', authenticateToken, async (req, res) => {
  const { name, price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(422).json({ error: "ValidationError", message: "Name, price, and stock are required" });
  }


  if (Number(price) < 1) {
    return res.status(422).json({ error: "ValidationError", message: "Price must be more than or equal to 1" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, stock, req.user.user_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/v1/products', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM products WHERE user_id = $1 AND deleted_at IS NULL';
    let params = [req.user.user_id];

    if (search) {
      query += ' AND name ILIKE $2';
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch('/api/v1/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (product.rows.length === 0 || product.rows[0].deleted_at !== null) {
      return res.status(404).json({ message: "Product not found" });
    }


    if (product.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden", message: "You dont own this product" });
    }

    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), stock = COALESCE($3, stock) WHERE id = $4 RETURNING *',
      [name, price, stock, id]
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/v1/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (product.rows.length === 0 || product.rows[0].deleted_at !== null) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden", message: "You dont own this product" });
    }

    await pool.query('UPDATE products SET deleted_at = NOW() WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: "Product deleted successfully (Soft Delete)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});