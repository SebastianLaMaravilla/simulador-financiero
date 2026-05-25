const express = require('express');
const { Simulation } = require('../models/Simulation');

const router = express.Router();

router.get('/reporte', async (req, res) => {
  try {
    const uid = String(req.query.uid || req.query.user_id || '').trim();

    if (!uid) {
      return res.status(400).json({ ok: false, message: 'Falta uid' });
    }

    const total = await Simulation.countDocuments({ user_id: uid });
    const last = await Simulation.findOne({ user_id: uid }).sort({ created_at: -1 }).lean();

    return res.json({
      ok: true,
      data: {
        total_registros: total,
        ultimo_registro: last?.created_at ? new Date(last.created_at).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      detail: error.message,
    });
  }
});

module.exports = router;

router.get('/estadisticas', async (req, res) => {
  try {
    const uid = String(req.query.uid || req.query.user_id || "").trim();

    if (!uid) {
      return res.status(400).json({ ok: false, message: 'Falta uid' });
    }

    const total = await Simulation.countDocuments({ user_id: uid });
    const last = await Simulation.findOne({ user_id: uid }).sort({ created_at: -1 }).lean();

    return res.json({
      ok: true,
      data: {
        total_registros: total,
        ultimo_registro: last?.created_at ? new Date(last.created_at).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      detail: error.message,
    });
  }
});

