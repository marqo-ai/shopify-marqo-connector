require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { processProduct, deleteProduct } = require('./marqo-service');

const app = express();
const PORT = process.env.PORT || 5000;

// Special body parser for HMAC validation
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('TrueClassic-Marqo Connector is running');
});

// Verify Shopify webhook
function verifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  
  const calculated = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('base64');
    
  console.log('Webhook verification:', {
    receivedHmac: hmac,
    calculatedHmac: calculated,
    isValid: calculated === hmac
  });
    
  return calculated === hmac;
}

// Webhook handlers
app.post('/webhooks/products/create', async (req, res) => {
  console.log('Received product creation webhook:', {
    headers: req.headers,
    body: JSON.stringify(req.body, null, 2)
  });

  if (!verifyWebhook(req)) {
    console.log('Webhook verification failed for product creation');
    return res.status(401).send('Unauthorized');
  }
  
  try {
    await processProduct(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing product creation:', error);
    res.status(200).send('OK'); // Still return 200 to acknowledge receipt
  }
});

app.post('/webhooks/products/update', async (req, res) => {
  console.log('--------------------------------');
  console.log('Received product update webhook');
  console.log('Product data:', JSON.stringify(req.body, null, 2));
  console.log('Images:', req.body.images);
  console.log('--------------------------------');

  if (!verifyWebhook(req)) {
    console.log('Webhook verification failed for product update');
    return res.status(401).send('Unauthorized');
  }
  
  try {
    await processProduct(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing product update:', error);
    res.status(200).send('OK');
  }
});

app.post('/webhooks/products/delete', async (req, res) => {
  console.log('Received product deletion webhook:', {
    headers: req.headers,
    body: JSON.stringify(req.body, null, 2)
  });

  if (!verifyWebhook(req)) {
    console.log('Webhook verification failed for product deletion');
    return res.status(401).send('Unauthorized');
  }
  
  try {
    await deleteProduct(req.body.id);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing product deletion:', error);
    res.status(200).send('OK');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 