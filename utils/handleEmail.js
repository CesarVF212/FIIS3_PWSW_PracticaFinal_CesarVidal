// --- GESTIÓN DEL ENVÍO DE EMAILS --- //

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// Configuración del canal de envio de emails con nodemailer y OAuth2 de Google.
const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    // Obtenemos todos los datos del .env.
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  // Y establecemos las credenciales del cliente OAuth2.
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  // Y ahora obtenemos el token de acceso.
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(
          `(utils/handleEmail.js) Error al obtener el token de acceso:\n ${err}`
        );
      }
      resolve(token);
    });
  });

  // Creamos el transporter de nodemailer con el token de acceso.
  // Este transporter se usará para enviar los emails.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

// Envio de emails.
const sendEmail = async (emailOptions) => {
  try {
    // Utilizamos las funciones anteriores para crear las autorizaciones y medios necesarios.
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
    return { success: true };
  } catch (error) {
    console.log(`(utils/handleEmail) No se pudo enviar el correo:\n${error}`);
    return { success: false, error };
  }
};

// Envio de emails de verificación y restablecimiento de contraseña.
const sendVerificationEmail = async (email, code) => {
  const emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification Code",
    // Código html que me ha hecho una IA para el formato del email.
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Email Verification</h2>
        <p>Thank you for registering! To complete your registration, please enter the following verification code:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this verification, you can safely ignore this email.</p>
        <p>Best regards,<br>Albaranes Management System</p>
      </div>
    `,
  };

  // Esa cadena es la que recibirá el cliente esperando a verificar su cuenta.
  return await sendEmail(emailOptions);
};

// Envio de emails de restablecimiento de contraseña.
const sendPasswordResetEmail = async (email, code) => {
  const emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset</h2>
        <p>You have requested to reset your password. Please enter the following code to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>Albaranes Management System</p>
      </div>
    `,
  };
  return await sendEmail(emailOptions);
};

// Envio de emails de invitación a la empresa.
const sendInvitationEmail = async (email, companyName, inviteLink) => {
  const emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Invitation to join ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Company Invitation</h2>
        <p>You have been invited to join ${companyName} on our Albaranes Management System.</p>
        <p>To accept the invitation, please click the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${inviteLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </div>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>Albaranes Management System</p>
      </div>
    `,
  };

  return await sendEmail(emailOptions);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvitationEmail,
};
