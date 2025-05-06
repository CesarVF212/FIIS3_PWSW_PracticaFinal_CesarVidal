// --- GESTIÓN DEL ENVÍO DE EMAILS --- //
// Versión simplificada para pruebas

const nodemailer = require("nodemailer");

// Creamos una función simulada para envío de emails durante desarrollo
const sendEmail = async (emailOptions) => {
  try {
    // En lugar de enviar el correo realmente, solo simulamos que funciona
    console.log("SIMULANDO ENVÍO DE EMAIL:");
    console.log("De:", emailOptions.from);
    console.log("Para:", emailOptions.to);
    console.log("Asunto:", emailOptions.subject);
    console.log(
      "Contenido:",
      emailOptions.html ? "HTML Content" : emailOptions.text
    );

    // Simulamos éxito
    return { success: true };
  } catch (error) {
    console.error("Error simulando envío de email:", error);
    return { success: false, error };
  }
};

// Función simulada para enviar correo de verificación
const sendVerificationEmail = async (email, code) => {
  console.log(
    `[SIMULACIÓN] Enviando código de verificación ${code} a ${email}`
  );
  return { success: true };
};

// Función simulada para enviar correo de reset de contraseña
const sendPasswordResetEmail = async (email, code) => {
  console.log(`[SIMULACIÓN] Enviando código de reset ${code} a ${email}`);
  return { success: true };
};

// Función simulada para enviar invitación
const sendInvitationEmail = async (email, companyName, inviteLink) => {
  console.log(
    `[SIMULACIÓN] Enviando invitación para ${companyName} a ${email}`
  );
  console.log(`Link de invitación: ${inviteLink}`);
  return { success: true };
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvitationEmail,
};
