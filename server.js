const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/updateCSV', (req, res) => {
    console.log('Headers:', req.headers); // Debugging log
    console.log('Body:', req.body); // Debugging log
    const items = req.body;
    console.log('Received items:', items);
    
    const csvLines = Object.entries(items).map(([id, prices]) => {
        return prices.map(price => `${id},${price}`).join('\n');
    }).join('\n');

    console.log('CSV content to write:', csvLines); // Debugging log

    fs.writeFile(path.join(__dirname, 'vendeur_prix.csv'), csvLines, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err); // Debugging log
            return res.status(500).send('Error writing to CSV file');
        }
        console.log('CSV file updated successfully'); // Debugging log
        res.status(200).send('CSV file updated');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});