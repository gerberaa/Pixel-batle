const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Віддавати всі статичні файли з поточної директорії
app.use(express.static(path.join(__dirname)));

// Головна сторінка
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 