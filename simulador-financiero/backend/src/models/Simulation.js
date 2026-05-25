const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true, trim: true },
    user_name: { type: String, default: 'Usuario', trim: true },
    user_email: { type: String, default: '', trim: true },
    monto: { type: Number, required: true },
    tasa_mensual: { type: Number, required: true },
    meses: { type: Number, required: true },
    interes_total: { type: Number, required: true },
    total_pagar: { type: Number, required: true },
    cuota_mensual: { type: Number, required: true },
    riesgo: { type: String, required: true },
    created_at: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
  }
);

simulationSchema.index({ user_id: 1, created_at: -1 });

function serialize(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    user_id: plain.user_id,
    user_name: plain.user_name,
    user_email: plain.user_email,
    monto: Number(plain.monto),
    tasa_mensual: Number(plain.tasa_mensual),
    meses: Number(plain.meses),
    interes_total: Number(plain.interes_total),
    total_pagar: Number(plain.total_pagar),
    cuota_mensual: Number(plain.cuota_mensual),
    riesgo: plain.riesgo,
    created_at: plain.created_at ? new Date(plain.created_at).toISOString() : null,
  };
}

const Simulation = mongoose.model('Simulation', simulationSchema);

module.exports = {
  Simulation,
  serialize,
};
