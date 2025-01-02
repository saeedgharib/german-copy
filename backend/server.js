
// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const {DB} = require('./database/firebaseConfig');
const { getDocs,collection } = require('firebase/firestore');
// Middleware
app.use(bodyParser.json());


// Routes


const stripe = require('stripe')('sk_test_51QEIiGCRwZ65hD9OQXlpO0fVv30YNMnibAFUlVJXogAgAHVRpMhP9CToRmo3WMLfA3uDyaZwZ2RbBLaWFVZIVlbQ00eNaXpQPq');
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
app.get('/pubkey', async(req, res) => {
    res.json({key:"pk_test_51QEIiGCRwZ65hD9Onm8DbIIWq0L7dU4nY9tA2UiGz02kkFEVQC8QxGdYUHXKvurk1uApOjCYZtIFrSBUt1cMV8DH00XzShCn9k"})

})


app.get('/transactions', async (req, res) => {
  console.log("HIT");
  
  try {
      // Fetch Stripe transactions
      const transactions = await stripe.paymentIntents.list({
          limit: 100, // Adjust as needed
      });

      // res.status(200).json(transactions);
      // res.setHeader('Content-Type', 'application/json');
      // console.log(response.json());
      
res.status(200).json(transactions);

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/payment-sheet', async (req, res) => {
  const { total, metadata } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // convert to cents
      currency: 'pkr',
      metadata: {
        jobId: metadata.jobId,
        userId: metadata.userId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// app.post("/payment-sheet", async (req, res) => {
//   try {
//     const { total } = req.body;
//     // const formattedTotal = parseInt(total.replace(".", ""));
//     // console.log("Total amount (in subunits):", formattedTotal);
//     if (!total || total <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     const customer = await stripe.customers.create();
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: '2024-09-30.acacia' }
//     );
    
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(total), // Ensure integer
//       currency: 'PKR',
//       customer: customer.id,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     console.log("HIT");
//     res.json({
//       paymentIntent: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: customer.id
//     });
    
//   } catch (error) {
//     console.error('Payment sheet error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.post('/authentication/drivers',async(req, res) => {
  const email = req.body.email
  console.log(email);
  let list=[]
  try {
    console.log("Hit Authentication");
  
    const querySnapshot = await getDocs(collection(DB, "drivers"));
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
  list.push(doc.data());
});
    
    res.send(list);
    
  } catch (error) {
    
  }



})
app.listen(3000, () => {
 
  console.log('Listening on http://localhost:3000');
});



