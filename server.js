const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Item = require('./models/Item');
const mongoose = require('mongoose');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/loadCSV', (req, res) => {
    const results = [];
    const filePath = path.join(__dirname, 'vendeur_prix.csv');
    console.log('Loading CSV file...'); // Debugging log

    if (!fs.existsSync(filePath)) {
        console.error('CSV file not found:', filePath); // Debugging log
        return res.json(results);
    }

    fs.createReadStream(path.join(__dirname, 'vendeur_prix.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('CSV file loaded:', results); // Debugging log
            res.json(results);
        });
});

app.post('/saveToCSV', (req, res) => {
    console.log('Headers:', req.headers); // Debugging log
    console.log('Body:', req.body); // Debugging log
    const itemOrder = req.body;
    console.log('Received item order:', itemOrder);

    const header = 'id,price\n';
    
    const csvLines = itemOrder.map(({ id, price }) => `${id},${price}`).join('\n');

    const csvContent = header + csvLines;

    console.log('CSV content to write:', csvContent); // Debugging log

    const filePath = path.join(__dirname, 'vendeur_prix.csv');
 
    fs.writeFile(filePath, csvContent, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err); // Debugging log
            return res.status(500).send('Error writing to CSV file');
        }
        console.log('CSV file updated successfully'); // Debugging log
        res.status(200).send('CSV file updated');
    });
});

app.post('/updateDB', async (req, res) => {
    try {
    // Connect to MongoDB
        mongoose.connect('mongodb://localhost:27017/itemsDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
        })
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('Could not connect to MongoDB', err));
    } catch (err) {
        console.error('Error connecting to database:', err); // Debugging log
        res.status(500).send('Error connecting to database');
    }

    const items = req.body;
    console.log('Received items:', items);

    try {
        // Retrieve all existing items from the database
        const existingItems = await Item.find({});
        const existingItemIds = new Set(existingItems.map(item => item.id));

        // Track processed IDs
        const processedIds = new Set();

        // Process incoming items
        for (const [id, prices] of Object.entries(items)) {
            const itemData = { id, prices: prices.map(price => parseInt(price)) };
            console.log("itemData: ", itemData);
            await Item.findOneAndUpdate(
                { id },
                itemData,
                { upsert: true, new: true, useFindAndModify: false }
            );
            processedIds.add(id);
        }

        // Delete items that are no longer present in the incoming data
        for (const id of existingItemIds) {
            if (!processedIds.has(id)) {
                await Item.deleteOne({ id });
                console.log(`Deleted item with id: ${id}`);
            }
        }

        res.status(200).send('Items saved to database');
    } catch (err) {
        console.error('Error saving items to database:', err); // Debugging log
        res.status(500).send('Error saving items to database');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});