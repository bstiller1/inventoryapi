const express = require('express');
const db = require('./db');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// ROUTES
/**
 * @route GET /items
 * @desc Fetch all inventory items
 * 
 */
app.get('/items', async (req, res) => {
    try{
        // Destructure the result to get the first element
        const [rows] = await db.query('SELECT * FROM items');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route POST /items
 * @desc Add a new item to the inventory
 */
app.post('/items', async (req, res) => {
    const { name, quantity, price } = req.body;
    // Basic Validation
    if (!name || quantity === undefined || !price){
        return res.status(400).json({ message: "Please provide name, quantity and price." });
    }
    try{
        const sql = 'INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)';
        // ? placeholders prevents SQL Injection
        const [result] = await db.execute(sql, [name, quantity, price]);

        res.status(201).json({
            id: result.insertId,
            message: "Item added successfully"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route PUT /items/:id
 * @desc Update an existing item's quantity or price
 */
app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;

    try {
        const sql = 'UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?';
        const [result] = await db.execute(sql, [name, quantity, price, id]);

        if (result.affectedRows === 0){
            return res.status(404).json({ message: "Item not found" });
        }
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message() });
    }
});

/**
 * @route DELETE /items/:id
 * @desc Remove an item from inventory
 */
app.delete('/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);

        if (result.affectedRows === 0){
            return res.status(404).json({ message: "Item not found." });
        }
        res.json({ message: "Item deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Inventory Server running on http://localhost:${PORT}`);
});