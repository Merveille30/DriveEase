const supabase = require('./supabase');
const { sendEmail, emails } = require('./email');

async function createNotification({ userEmail, title, message, type = 'info', bookingId = null }) {
  try {
    await supabase.from('tblnotifications').insert({
      userEmail, title, message, type, bookingId, isRead: false
    });
  } catch (err) {
    console.error('Notification insert error:', err.message);
  }
}

// Called when user makes a booking
async function onBookingCreated(booking, vehicle, user) {
  // Notify user
  await createNotification({
    userEmail: booking.userEmail,
    title: 'Booking Submitted',
    message: `Your booking for ${vehicle.VehiclesTitle} (${booking.FromDate} → ${booking.ToDate}) is pending confirmation.`,
    type: 'info',
    bookingId: booking.id
  });

  // Notify admin
  await createNotification({
    userEmail: 'admin',
    title: 'New Booking Received',
    message: `${user?.FullName || booking.userEmail} booked ${vehicle.VehiclesTitle} from ${booking.FromDate} to ${booking.ToDate}.`,
    type: 'booking',
    bookingId: booking.id
  });

  // Send emails
  if (user) await sendEmail(emails.bookingReceived(user, vehicle, booking));
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) await sendEmail(emails.newBookingAdmin(adminEmail, user, vehicle, booking));
}

// Called when admin changes booking status
async function onBookingStatusChanged(booking, vehicle, user, status) {
  if (status === 1) {
    // Confirmed
    await createNotification({
      userEmail: booking.userEmail,
      title: '✅ Booking Confirmed!',
      message: `Your booking for ${vehicle?.VehiclesTitle} has been confirmed. Enjoy your ride!`,
      type: 'success',
      bookingId: booking.id
    });
    if (user) await sendEmail(emails.bookingConfirmed(user, vehicle, booking));
  } else if (status === 2) {
    // Cancelled
    await createNotification({
      userEmail: booking.userEmail,
      title: '❌ Booking Cancelled',
      message: `Your booking for ${vehicle?.VehiclesTitle} (Booking #${booking.BookingNumber}) has been cancelled.`,
      type: 'error',
      bookingId: booking.id
    });
    if (user) await sendEmail(emails.bookingCancelled(user, vehicle, booking));
  }
}

module.exports = { createNotification, onBookingCreated, onBookingStatusChanged };
