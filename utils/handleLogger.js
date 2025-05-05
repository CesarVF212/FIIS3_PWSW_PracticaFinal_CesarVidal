// --- SE ENCARGA DE USAR SLACK PARA ENVIAR MENSAJES --- //

const { IncomingWebhook } = require("@slack/webhook");

// Obtenemos la URL del webhook de Slack desde el .env.
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

// Lo enviamos a Slack con el formato adecuado.
const loggerStream = {
  write: (message) => {
    webHook.send({
      text: message,
    });
  },
};

module.exports = loggerStream;
