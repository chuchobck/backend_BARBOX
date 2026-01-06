// src/controllers/paypal.controller.js - Controlador de PayPal
// � PERSONA 2: Integración PayPal

import { paypalConfig, getPayPalAccessToken } from '../config/paypal.js';

/**
 * POST /api/v1/paypal/crear-orden
 * Crear orden de pago en PayPal
 */
export const crearOrdenPayPal = async (req, res, next) => {
  try {
    const { facturaId, total, items } = req.body;

    // Validaciones
    if (!facturaId || !total) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de factura y total son requeridos',
        data: null
      });
    }

    // TODO: Obtener token de PayPal
    // const accessToken = await getPayPalAccessToken();

    // TODO: Crear orden en PayPal
    // const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     intent: 'CAPTURE',
    //     purchase_units: [{
    //       reference_id: `FACT-${facturaId}`,
    //       amount: {
    //         currency_code: 'USD',
    //         value: total.toFixed(2)
    //       }
    //     }]
    //   })
    // });

    res.json({
      status: 'success',
      message: 'Orden de PayPal creada',
      data: {
        orderId: 'PAYPAL-ORDER-ID-EJEMPLO',
        approveUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=...'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/paypal/confirmar
 * Confirmar pago de PayPal
 */
export const confirmarPagoPayPal = async (req, res, next) => {
  try {
    const { orderId, facturaId } = req.body;

    // Validaciones
    if (!orderId || !facturaId) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID de PayPal e ID de factura son requeridos',
        data: null
      });
    }

    // TODO: Capturar el pago en PayPal
    // const accessToken = await getPayPalAccessToken();
    // const response = await fetch(
    //   `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );

    // TODO: Si el pago fue exitoso, aprobar la factura
    // Llamar a sp_factura_aprobar con la referencia de PayPal

    res.json({
      status: 'success',
      message: 'Pago confirmado. Factura aprobada.',
      data: {
        facturaId,
        paypalRef: orderId,
        estado: 'APR'
      }
    });
  } catch (err) {
    next(err);
  }
};
