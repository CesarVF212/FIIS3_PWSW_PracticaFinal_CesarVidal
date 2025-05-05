// -- SE ENCARGA DE SUBIR ARCHIVOS A IPFS CON PINATA -- //
const uploadToPinata = async (fileBuffer, fileName) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  // Preparamos el archivo para subirlo a Pinata.
  let data = new FormData();
  const blob = new Blob([fileBuffer]);
  data.append("file", blob, fileName);

  // Aádimos los metadatos del archivo.
  const metadata = JSON.stringify({
    name: fileName,
  });
  data.append("pinataMetadata", metadata);

  // Añadimos las opciones de Pinata.
  const options = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", options);

  // Intentamos subir el archivo a Pinata.
  // Si no se puede subir, lanzamos un error.
  try {
    const response = await fetch(url, {
      method: "POST",
      body: data,
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `(utils/handleUploadIPFS.js) Error al contactar a Piñata:\n${response.statusText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(
      `(utils/handleUploadIPFS.js) Error al subir el archivo a Piñata:\n${error}`
    );
    throw error;
  }
};

// Función para obtener la URL de IPFS a partir del hash.
const getIpfsUrl = (ipfsHash) => {
  return `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;
};

module.exports = { uploadToPinata, getIpfsUrl };
