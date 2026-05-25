# Simulador Financiero Detallado de Préstamos

Proyecto full-stack adaptado a **MEAN Stack**:

- **MongoDB** como base de datos
- **Node.js** como entorno de ejecución
- **Express** para el backend
- **Angular** en el frontend
- **Firebase Authentication** con Google SSO
- **Chart.js** para las gráficas

## Estructura del proyecto

- `src/` → aplicación Angular
- `backend/` → API en Node.js + Express + MongoDB
- `public/` → archivos públicos de Angular

## Requisitos funcionales cubiertos

- Login con Google
- Dashboard con nombre, correo, último registro y total de simulaciones
- Cálculo de interés total, total a pagar, cuota mensual y clasificación de riesgo
- Guardado por usuario en MongoDB
- Historial filtrado por `uid`
- Gráfica circular: capital vs intereses
- Gráfica de línea: saldo pendiente mes a mes
- API externa de referencia de mercado

## Instalación rápida

### 1) Frontend Angular

Instala dependencias y levanta Angular:

```bash
npm install
npm start
```

### 2) Backend Node + Express

Entra a la carpeta `backend/` e instala dependencias:

```bash
cd backend
npm install
npm run dev
```

### 3) MongoDB

Crea una base de datos en MongoDB (local o Atlas) y define la variable de entorno:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/simulador_financiero
PORT=3000
CORS_ORIGIN=http://localhost:4200
```

## Endpoints del backend

- `POST /api/simulaciones` → guardar simulación
- `GET /api/simulaciones?uid=...` → historial del usuario
- `GET /api/reporte?uid=...` → resumen del dashboard
- `GET /api/mercado` → indicador externo de mercado

## Observación

Cada consulta se filtra por `user_id`, así cada usuario ve solo sus propios registros.
