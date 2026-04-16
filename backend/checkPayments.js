const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/eventmitra').then(async () => {
  const Payment = mongoose.model('Payment');
  const bookingId = new mongoose.Types.ObjectId('69df3024b87af955d7f1fef0');
  
  const payments = await Payment.find({ booking: bookingId });
  console.log('Existing payments for booking:', payments.length);
  payments.forEach(p => {
    console.log(' - paymentType:', p.paymentType, ', status:', p.status, ', amount:', p.amount);
  });
  
  process.exit(0);
}).catch(e => { 
  console.error('Error:', e.message); 
  process.exit(1); 
});