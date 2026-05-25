const express = require('express');

const router = express.Router();

function fallbackMarketData() {
  return [
    { entidad: 'Mercado Internacional', tasa_mensual: 1.2, tipo: 'Referencia USD/EUR', moneda: 'EUR' },
    { entidad: 'Mercado Internacional', tasa_mensual: 1.7, tipo: 'Referencia USD/GBP', moneda: 'GBP' },
    { entidad: 'Mercado Internacional', tasa_mensual: 2.4, tipo: 'Referencia USD/JPY', moneda: 'JPY' },
  ];
}

router.get('/mercado', async (_req, res) => {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=USD');

    if (!response.ok) {
      throw new Error(`Frankfurter respondió ${response.status}`);
    }

    const json = await response.json();
    const currencies = ['EUR', 'GBP', 'JPY', 'CAD', 'MXN'];

    const data = currencies
      .filter((currency) => typeof json?.rates?.[currency] === 'number')
      .map((currency) => ({
        entidad: 'Mercado Internacional',
        tasa_mensual: Number((json.rates[currency] * 100).toFixed(2)),
        tipo: `Tipo de cambio USD/${currency}`,
        moneda: currency,
      }));

    return res.json({
      ok: true,
      data: data.length ? data : fallbackMarketData(),
    });
  } catch (error) {
    console.warn('API externa no disponible, usando datos de respaldo:', error.message);
    return res.json({
      ok: true,
      data: fallbackMarketData(),
    });
  }
});

module.exports = router;
