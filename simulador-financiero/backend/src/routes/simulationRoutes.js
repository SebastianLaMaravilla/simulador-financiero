const express = require('express');
const { Simulation, serialize } = require('../models/Simulation');

const router = express.Router();

router.post('/simulaciones', async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.user_id) {
      return res.status(400).json({ ok: false, message: 'Falta user_id' });
    }

    const created = await Simulation.create({
      user_id: payload.user_id,
      user_name: payload.user_name || 'Usuario',
      user_email: payload.user_email || '',
      monto: Number(payload.monto) || 0,
      tasa_mensual: Number(payload.tasa_mensual) || 0,
      meses: Number(payload.meses) || 0,
      interes_total: Number(payload.interes_total) || 0,
      total_pagar: Number(payload.total_pagar) || 0,
      cuota_mensual: Number(payload.cuota_mensual) || 0,
      riesgo: payload.riesgo || '',
    });

    return res.status(201).json({
      ok: true,
      message: 'Simulación guardada correctamente',
      data: serialize(created),
    });
  } catch (error) {
    console.error('Error guardando simulación:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      detail: error.message,
    });
  }
});

router.get('/simulaciones', async (req, res) => {
  try {
    const uid = String(req.query.uid || req.query.user_id || '').trim();

    if (!uid) {
      return res.status(400).json({ ok: false, message: 'Falta uid' });
    }

    const rows = await Simulation.find({ user_id: uid }).sort({ created_at: -1 }).lean();

    return res.json({
      ok: true,
      data: rows.map((item) => ({
        id: String(item._id),
        user_id: item.user_id,
        user_name: item.user_name,
        user_email: item.user_email,
        monto: Number(item.monto),
        tasa_mensual: Number(item.tasa_mensual),
        meses: Number(item.meses),
        interes_total: Number(item.interes_total),
        total_pagar: Number(item.total_pagar),
        cuota_mensual: Number(item.cuota_mensual),
        riesgo: item.riesgo,
        created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
      })),
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      detail: error.message,
    });
  }
});

module.exports = router;
