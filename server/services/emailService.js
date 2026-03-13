const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function bookingEmailHtml({ patientName, doctorName, date, timeSlot }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; }
      .wrapper { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px 32px 24px; text-align: center; }
      .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
      .header p { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
      .body { padding: 32px; }
      .greeting { font-size: 15px; color: #1e293b; font-weight: 600; margin-bottom: 8px; }
      .message { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .card-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
      .card-row:last-child { border-bottom: none; padding-bottom: 0; }
      .card-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
      .card-value { font-size: 13px; color: #1e293b; font-weight: 600; }
      .badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
      .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🏥 Appointment Confirmed</h1>
        <p>Smart Clinic Appointment System</p>
      </div>
      <div class="body">
        <div class="greeting">Hello, ${patientName}!</div>
        <div class="message">Your appointment has been successfully booked. Please find the details below and arrive 10 minutes early.</div>
        <div class="card">
          <div class="card-row">
            <span class="card-label">Doctor</span>
            <span class="card-value">Dr. ${doctorName}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Date</span>
            <span class="card-value">${date}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Time</span>
            <span class="card-value">${timeSlot}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Status</span>
            <span class="card-value"><span class="badge">Confirmed</span></span>
          </div>
        </div>
        <div class="message">If you need to reschedule or have any questions, please contact the clinic directly.</div>
      </div>
      <div class="footer">This is an automated message from Smart Clinic. Please do not reply to this email.</div>
    </div>
  </body>
  </html>
  `;
}

function cancellationEmailHtml({ patientName, doctorName, date, timeSlot }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; }
      .wrapper { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #dc2626, #9333ea); padding: 32px 32px 24px; text-align: center; }
      .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
      .header p { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
      .body { padding: 32px; }
      .greeting { font-size: 15px; color: #1e293b; font-weight: 600; margin-bottom: 8px; }
      .message { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
      .card { background: #fff5f5; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .card-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fecaca; }
      .card-row:last-child { border-bottom: none; padding-bottom: 0; }
      .card-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
      .card-value { font-size: 13px; color: #1e293b; font-weight: 600; }
      .badge { display: inline-block; background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
      .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>❌ Appointment Cancelled</h1>
        <p>Smart Clinic Appointment System</p>
      </div>
      <div class="body">
        <div class="greeting">Hello, ${patientName},</div>
        <div class="message">We're sorry to inform you that your appointment has been cancelled. Please contact the clinic to reschedule at your earliest convenience.</div>
        <div class="card">
          <div class="card-row">
            <span class="card-label">Doctor</span>
            <span class="card-value">Dr. ${doctorName}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Date</span>
            <span class="card-value">${date}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Time</span>
            <span class="card-value">${timeSlot}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Status</span>
            <span class="card-value"><span class="badge">Cancelled</span></span>
          </div>
        </div>
        <div class="message">We apologize for any inconvenience caused. Please call the clinic to book a new appointment.</div>
      </div>
      <div class="footer">This is an automated message from Smart Clinic. Please do not reply to this email.</div>
    </div>
  </body>
  </html>
  `;
}

async function sendBookingConfirmation({ toEmail, patientName, doctorName, date, timeSlot }) {
  try {
    await transporter.sendMail({
      from: `"Smart Clinic" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `✅ Appointment Confirmed – Dr. ${doctorName} on ${date} at ${timeSlot}`,
      html: bookingEmailHtml({ patientName, doctorName, date, timeSlot }),
    });
    console.log(`Booking confirmation email sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send booking email:', err.message);
  }
}

async function sendCancellationNotice({ toEmail, patientName, doctorName, date, timeSlot }) {
  try {
    await transporter.sendMail({
      from: `"Smart Clinic" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `❌ Appointment Cancelled – Dr. ${doctorName} on ${date} at ${timeSlot}`,
      html: cancellationEmailHtml({ patientName, doctorName, date, timeSlot }),
    });
    console.log(`Cancellation email sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send cancellation email:', err.message);
  }
}

module.exports = { sendBookingConfirmation, sendCancellationNotice };