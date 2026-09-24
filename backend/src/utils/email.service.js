const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtp.host || !env.smtp.user) {
    console.warn(
      '[email.service] SMTP no configurado. Los correos no se enviarán.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465, // true para 465, false para 587/2525
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  return transporter;
}

function buildVerificationEmailHtml(code, nombre = '') {
  const safeName = nombre ? `Hola ${nombre},` : 'Hola,';
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#1f2937;margin-top:0;">Zone Kids · Verificación en dos pasos</h2>
    <p style="color:#374151;">${safeName}</p>
    <p style="color:#374151;">Usa el siguiente código para completar tu inicio de sesión:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;font-size:32px;letter-spacing:8px;font-weight:bold;color:#111827;background:#f3f4f6;padding:12px 20px;border-radius:8px;">
        ${code}
      </span>
    </div>
    <p style="color:#6b7280;font-size:14px;">
      Este código expira en <strong>${env.twoFactor.expiryMinutes} minutos</strong>.
    </p>
    <p style="color:#b91c1c;font-size:13px;background:#fee2e2;padding:10px;border-radius:6px;">
      ⚠️ Nadie de Zone Kids te pedirá este código. No lo compartas con nadie.
    </p>
  </div>`;
}

async function sendVerificationCode(email, code, nombre = '') {
  const tx = getTransporter();

  if (!tx) {
    // Modo dev sin SMTP: log para que puedas probar
    console.log(`[DEV] Código 2FA para ${email}: ${code}`);
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  try {
    const info = await tx.sendMail({
      from: env.smtp.from,
      to: email,
      subject: 'Tu código de verificación Zone Kids',
      text: `Tu código de verificación es: ${code}. Expira en ${env.twoFactor.expiryMinutes} minutos. No lo compartas con nadie.`,
      html: buildVerificationEmailHtml(code, nombre),
    });
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    console.error('[email.service] Error enviando correo:', err.message);
    // No arrojamos para no romper el flujo de login; el usuario podrá reenviar.
    return { delivered: false, reason: err.message };
  }
}

module.exports = { sendVerificationCode };