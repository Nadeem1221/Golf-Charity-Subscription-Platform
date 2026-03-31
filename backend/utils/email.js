const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Generic send helper ──────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"Golf Charity Platform" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Non-fatal — log and continue
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(user) {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Golf Charity Platform!',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Subscribe to start entering scores and participating in monthly draws.</p>
      <p>Thank you for supporting your chosen charity.</p>
    `,
  });
}

// ─── Draw results email ───────────────────────────────────────────────────────
async function sendDrawResultsEmail(user, draw, matchType, prizeAmount) {
  const isWinner = !!matchType;
  await sendEmail({
    to: user.email,
    subject: isWinner
      ? `🎉 You won the ${draw.name} Draw!`
      : `${draw.name} Draw Results`,
    html: isWinner
      ? `
        <h2>Congratulations, ${user.name}!</h2>
        <p>You had a <strong>${matchType}</strong> in the ${draw.name} draw.</p>
        <p>Prize amount: <strong>$${(prizeAmount / 100).toFixed(2)}</strong></p>
        <p>Please log in to upload your verification screenshot to claim your prize.</p>
      `
      : `
        <h2>Hi ${user.name},</h2>
        <p>The ${draw.name} draw has been published. Drawn numbers: <strong>${draw.drawnNumbers.join(', ')}</strong>.</p>
        <p>Better luck next month!</p>
      `,
  });
}

// ─── Winner verification status email ────────────────────────────────────────
async function sendVerificationStatusEmail(user, status, adminNote) {
  await sendEmail({
    to: user.email,
    subject: `Prize Verification ${status === 'approved' ? 'Approved ✅' : 'Update'}`,
    html: `
      <h2>Hi ${user.name},</h2>
      <p>Your prize verification has been <strong>${status}</strong>.</p>
      ${adminNote ? `<p>Note: ${adminNote}</p>` : ''}
      ${status === 'approved' ? '<p>Your payment will be processed shortly.</p>' : ''}
    `,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendDrawResultsEmail,
  sendVerificationStatusEmail,
};
