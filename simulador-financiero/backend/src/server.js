require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const simulationRoutes = require('./routes/simulationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const marketRoutes = require('./routes/marketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend MEAN funcionando' });
});

app.use('/api', simulationRoutes);
app.use('/api', reportRoutes);
app.use('/api', marketRoutes);

async function bootstrap() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
}

bootstrap();
