const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('placeholder')
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Use onboarding@resend.dev for free tier (works for verified emails only)
const FROM = 'DriveEase <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log(`[EMAIL SKIPPED - no API key] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error('Resend error:', result.error);
    } else {
      console.log(`✅ Email sent to ${to}: ${subject} (id: ${result.data?.id})`);
    }
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

// Email templates
const emails = {
  bookingReceived: (user, vehicle, booking) => ({
    to: user.EmailId,
    subject: `Booking Received — ${vehicle.VehiclesTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#e63946;padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.5rem">DriveEase</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">Booking Confirmation</p>
        </div>
        <div style="padding:2rem">
          <p style="color:#2d3748">Hi <strong>${user.FullName}</strong>,</p>
          <p style="color:#718096">Your booking request has been received and is pending confirmation.</p>
          <div style="background:#f8f9fa;border-radius:10px;padding:1.25rem;margin:1.5rem 0">
            <h3 style="color:#0d1117;margin:0 0 1rem">Booking Details</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:0.4rem 0;color:#718096">Vehicle</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${vehicle.VehiclesTitle}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Booking #</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.BookingNumber}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">From</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.FromDate}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">To</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.ToDate}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Total</td><td style="padding:0.4rem 0;font-weight:700;color:#e63946">$${vehicle.PricePerDay * Math.ceil((new Date(booking.ToDate) - new Date(booking.FromDate)) / 86400000)}</td></tr>
            </table>
          </div>
          <p style="color:#718096">We will notify you once your booking is confirmed by our team.</p>
        </div>
        <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;color:#718096;font-size:0.85rem">
          © ${new Date().getFullYear()} DriveEase. All rights reserved.
        </div>
      </div>
    `
  }),

  bookingConfirmed: (user, vehicle, booking) => ({
    to: user.EmailId,
    subject: `✅ Booking Confirmed — ${vehicle.VehiclesTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#10b981;padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.5rem">✅ Booking Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">DriveEase</p>
        </div>
        <div style="padding:2rem">
          <p style="color:#2d3748">Hi <strong>${user.FullName}</strong>,</p>
          <p style="color:#718096">Great news! Your booking has been <strong style="color:#10b981">confirmed</strong>. Enjoy your ride!</p>
          <div style="background:#d1fae5;border-radius:10px;padding:1.25rem;margin:1.5rem 0;border-left:4px solid #10b981">
            <h3 style="color:#065f46;margin:0 0 1rem">Confirmed Booking</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:0.4rem 0;color:#065f46">Vehicle</td><td style="padding:0.4rem 0;font-weight:600;color:#065f46">${vehicle.VehiclesTitle}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#065f46">Booking #</td><td style="padding:0.4rem 0;font-weight:600;color:#065f46">${booking.BookingNumber}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#065f46">From</td><td style="padding:0.4rem 0;font-weight:600;color:#065f46">${booking.FromDate}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#065f46">To</td><td style="padding:0.4rem 0;font-weight:600;color:#065f46">${booking.ToDate}</td></tr>
            </table>
          </div>
        </div>
        <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;color:#718096;font-size:0.85rem">
          © ${new Date().getFullYear()} DriveEase. All rights reserved.
        </div>
      </div>
    `
  }),

  bookingCancelled: (user, vehicle, booking) => ({
    to: user.EmailId,
    subject: `❌ Booking Cancelled — ${vehicle.VehiclesTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#ef4444;padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.5rem">Booking Cancelled</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">DriveEase</p>
        </div>
        <div style="padding:2rem">
          <p style="color:#2d3748">Hi <strong>${user.FullName}</strong>,</p>
          <p style="color:#718096">Your booking for <strong>${vehicle.VehiclesTitle}</strong> (Booking #${booking.BookingNumber}) has been cancelled.</p>
          <p style="color:#718096">If you have any questions, please contact us.</p>
        </div>
        <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;color:#718096;font-size:0.85rem">
          © ${new Date().getFullYear()} DriveEase. All rights reserved.
        </div>
      </div>
    `
  }),

  newBookingAdmin: (adminEmail, user, vehicle, booking) => ({
    to: adminEmail,
    subject: `🔔 New Booking — ${vehicle.VehiclesTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#0d1117;padding:2rem;text-align:center">
          <h1 style="color:#e63946;margin:0;font-size:1.5rem">DriveEase Admin</h1>
          <p style="color:rgba(255,255,255,0.7);margin:0.5rem 0 0">New Booking Received</p>
        </div>
        <div style="padding:2rem">
          <p style="color:#2d3748">A new booking has been submitted and requires your review.</p>
          <div style="background:#f8f9fa;border-radius:10px;padding:1.25rem;margin:1.5rem 0">
            <h3 style="color:#0d1117;margin:0 0 1rem">Booking Details</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:0.4rem 0;color:#718096">Customer</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${user?.FullName || booking.userEmail}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Email</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.userEmail}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Vehicle</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${vehicle.VehiclesTitle}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Booking #</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.BookingNumber}</td></tr>
              <tr><td style="padding:0.4rem 0;color:#718096">Dates</td><td style="padding:0.4rem 0;font-weight:600;color:#0d1117">${booking.FromDate} → ${booking.ToDate}</td></tr>
            </table>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/bookings" style="display:inline-block;background:#e63946;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600">
            Review Booking →
          </a>
        </div>
        <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;color:#718096;font-size:0.85rem">
          © ${new Date().getFullYear()} DriveEase Admin Panel
        </div>
      </div>
    `
  }),
};

module.exports = { sendEmail, emails };
