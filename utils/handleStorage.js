// --- GESTIONA EL ALMACENAMIENTO DE ARCHIVOS --- //

const multer = require("multer");
const path = require("path");

// Gestiona el almacenamiento de archivos en el servidor (este directorio).
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const pathStorage = path.join(__dirname, "../storage");
    callback(null, pathStorage);
  },
  filename: function (req, file, callback) {
    // Extrae la extensión del archivo original.
    const ext = file.originalname.split(".").pop();
    // Y creamos un nuevo nombre para el archivo.
    const filename = `file-${Date.now()}.${ext}`;
    callback(null, filename);
  },
});

// Crea la configuración de como se guardan las cosas en memoria.
const memory = multer.memoryStorage();

// Configuración del middleware para subir archivos (DISCO).
const uploadMiddleware = multer({ storage });

// Confiuración del middleware para subir archivos (RAM).
const uploadMiddlewareMemory = multer({ storage: memory });

module.exports = { uploadMiddleware, uploadMiddlewareMemory };
