// src/config/paypal.js - Configuración de PayPal

export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your-client-secret',
  mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox o live
  baseUrl: process.env.PAYPAL_MODE === 'live' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com'
};

export async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
  ).toString('base64');

  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}
