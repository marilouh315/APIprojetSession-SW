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
 * Documentation.json
 */
const swaggerUi = require('swagger-ui-express');
// Le fichier de documentation JSON, ajustez selon votre projet
const swaggerDocument = require('./src/config/documentation.json');
// Options le l'interface, changez le titre "Demo API" pour le nom de votre projet 
const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Projet de session API | Service Web"
};

/**
 * MORGAN
 */
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const erreurLogStream = fs.createWriteStream(path.join(__dirname, '../', 'error.log'), { flags: 'a' });
app.use(morgan('combined', { stream: erreurLogStream, skip: (req, res) => res.statusCode < 500 }));

/**
 * CORS
 */
const cors = require('cors');
// Déclaration des middlewares
app.use(cors());




//Routes pour la documentation.json
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

//Route ACCEUIL
app.get('api/taches/acceuil', (req, res) => {
    res.send("Bienvenue sur l'API de tâches");
});

//Routes TACHES
const tachesRoutes = require('./src/routes/appJS.route');
app.use('/api/liste_taches', tachesRoutes);

//Routes UTILISATEURS
const utilisateruRoutes = require('./src/routes/utilisateur.route');
app.use('/api/users', utilisateruRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
