const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Décompression du fichier zip
const unzipFile = (filePath, callback) => {
    exec(`unzip ${filePath} -d ${path.dirname(filePath)}`, (err) => {
        if (err) return callback(err);
        callback(null, path.dirname(filePath));
    });
};

// Récupération de la taille des fichiers
const getFileSizes = (dirPath) => {
    let fileSizes = [];
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        fileSizes.push({ name: file, size: stats.size });
    });

    return fileSizes.sort((a, b) => b.size - a.size);
};

// Route pour télécharger un fichier zip et lister les fichiers
app.post('/upload', upload.single('zipFile'), (req, res) => {
    const filePath = req.file.path;

    unzipFile(filePath, (err, extractedDir) => {
        if (err) return res.status(500).send(err.toString());

        const fileSizes = getFileSizes(extractedDir);
        res.json(fileSizes);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
