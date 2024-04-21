/**
 * Base
 */
const http = require('node:http');
const hostname = '127.0.0.1';
const PORT = 3000;

/**
 * Dotenv
 */
const dotenv = require('dotenv');
dotenv.config();
const cleAPI = process.env.cleAPI;


/**
 * Importer le module express
 */
const express = require ('express');
const app = express();
app.use(express.json())

/**
 * MORGAN
 */
const morgan = require('morgan')
app.use(morgan('dev')); // format prédifini, voir dans la doc



//Route ACCEUIL
app.get('api/taches/acceuil', (req, res) => {
    res.send("Bienvenue sur l'API de tâches");
});

//Routes TACHES
const tachesRoutes = require('./src/routes/appJS.route');
app.use('/api/liste_taches', tachesRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
