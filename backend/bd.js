const express = require('express');
const mysql = require('mysql');

const bodyParser = require('body-parser');

// Puerto en el que se ejecutará el servicio

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());



// Configuración de la base de datos
const connection = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  database: 'code',
  password: '',
  // port: 3306,
});

// Route
app.get('/', (req, res) => {
  res.send('Bienvenido!');
});

// Ruta para registrar una inversión
app.post('/investments', async (req, res) => {
  const { user, amount } = req.body;

  try {
    // Verificar el saldo del inversionista
    const balanceResult = connection.query('SELECT balance FROM investors WHERE user = $1', [user]);
    const balance = balanceResult.rows[0].balance;

    if (balance < 0) {
      return res.status(400).json({ error: 'Saldo del inversionista negativo' });
    }

    // Verificar el monto total de la oportunidad
    const totalAmountResult = connection.query('SELECT total_amount FROM opportunities');
    const totalAmount = totalAmountResult.rows[0].total_amount;

    if (amount > totalAmount) {
      return res.status(400).json({ error: 'Monto de inversión excede el monto total de la oportunidad' });
    }

    // Registrar la inversión en la base de datos
   connection.query('INSERT INTO investments (user, amount) VALUES ($1, $2)', [user, amount]);

    return res.status(200).json({ message: 'Inversión registrada correctamente' });
  } catch (error) {
    console.error('Error al procesar la inversión:', error);
    return res.status(500).json({ error: 'Error al procesar la inversión' });
  }
});



app.listen(PORT, () => {
  console.log(`Servicio de inversiones en funcionamiento en el puerto ${PORT}`);
});
