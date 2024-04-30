const Utilisateur = require("../models/utilisateur.model");

module.exports = (req, res, next) => {

    // Vérifier si la clé API est présente dans l'entête
    if(!req.headers.authorization) {
        return res.status(401).json({ message: "Vous devez fournir une clé api" });
    }

    // Récupérer la clé API
    const cleApi = req.headers.authorization;
    // Vérifier si la clé API est valide
    Utilisateur.validationCle(cleApi)
    .then(resultat => {
        if(!resultat) {
            return res.status(400).json({ message: "Clé API invalide" });
        } else {
            // La clé API est valide, on continue le traitement
            next();
        }
    })
    .catch(erreur => {
        return res.status(500).json({ message: "Erreur lors de la validation de la clé api" })
    });    
}
