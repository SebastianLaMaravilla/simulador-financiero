import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import {
  Auth,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { ApiService, DashboardReport, MarketRate, SimulationRecord } from './services/api.service';

type RiskLabel = 'Bajo riesgo' | 'Riesgo medio' | 'Alto riesgo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  usuario: User | null = null;
  cargandoAuth = true;

  vistaActiva: 'simulador' | 'historial' | 'graficas' | 'api' = 'simulador';

  reporte: DashboardReport | null = null;
  historial: SimulationRecord[] = [];
  tasasMercado: MarketRate[] = [];

  monto = 0;
  tasaMensual = 0;
  meses = 0;

  interesTotal = 0;
  totalPagar = 0;
  cuotaMensual = 0;
  riesgo: RiskLabel | '' = '';
  riesgoClase = '';
  calculado = false;

  tabla: Array<{ mes: number; cuota: string; interes: string; abono: string; saldo: string }> = [];

  promedioCuota = 0;
  simulacionMayorInteres: SimulationRecord | null = null;
  comparacionCuota = '';

  private chartPieActual: Chart | null = null;
  private chartLineActual: Chart | null = null;
  private chartPieHistorial: Chart | null = null;
  private chartLineHistorial: Chart | null = null;

  private authUnsubscribe?: () => void;

  constructor(
    private readonly api: ApiService,
    private readonly auth: Auth
  ) {}

  ngOnInit(): void {
    this.authUnsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.usuario = user;
      this.cargandoAuth = false;

      if (user) {
        this.cargarDatosUsuario();
        this.cargarTasasMercado();
      } else {
        this.resetEstado();
      }
    });
  }

  ngOnDestroy(): void {
    this.authUnsubscribe?.();
    this.destruirGraficas();
  }

  login(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider).catch((error) => {
      console.error('Error en login:', error);
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.resetEstado();
  }

  cambiarVista(vista: 'simulador' | 'historial' | 'graficas' | 'api'): void {
    this.vistaActiva = vista;

    if (vista === 'graficas') {
      setTimeout(() => this.actualizarGraficas(), 100);
    }
  }

  calcular(): void {
    if (this.monto <= 0 || this.tasaMensual <= 0 || this.meses <= 0 || !this.usuario) {
      return;
    }

    this.interesTotal = this.monto * (this.tasaMensual / 100) * this.meses;
    this.totalPagar = this.monto + this.interesTotal;
    this.cuotaMensual = this.totalPagar / this.meses;

    if (this.tasaMensual <= 1) {
      this.riesgo = 'Bajo riesgo';
      this.riesgoClase = 'bajo';
    } else if (this.tasaMensual <= 3) {
      this.riesgo = 'Riesgo medio';
      this.riesgoClase = 'medio';
    } else {
      this.riesgo = 'Alto riesgo';
      this.riesgoClase = 'alto';
    }

    this.generarTablaAmortizacion();
    this.calculado = true;
    this.actualizarGraficasLocales();

    this.api.guardarSimulacion({
      user_id: this.usuario.uid,
      user_name: this.usuario.displayName || 'Usuario',
      user_email: this.usuario.email || '',
      monto: this.monto,
      tasa_mensual: this.tasaMensual,
      meses: this.meses,
      interes_total: Number(this.interesTotal.toFixed(2)),
      total_pagar: Number(this.totalPagar.toFixed(2)),
      cuota_mensual: Number(this.cuotaMensual.toFixed(2)),
      riesgo: this.riesgo,
    }).subscribe({
      next: () => this.cargarDatosUsuario(),
      error: (error) => console.error('Error guardando simulación:', error),
    });
  }

  private cargarDatosUsuario(): void {
    if (!this.usuario) {
      return;
    }

    this.api.getReporte(this.usuario.uid).subscribe({
      next: (response: any) => {
  this.reporte = response.data;
},
      error: (error) => console.error('Error cargando reporte:', error),
    });

    this.api.getHistorial(this.usuario.uid).subscribe({
      next: (response: any) => {
  this.historial = response.data || [];
        this.calcularResumenHistorico();
        setTimeout(() => this.actualizarGraficasHistorial(), 100);
      },
      error: (error) => console.error('Error cargando historial:', error),
    });
  }

  private cargarTasasMercado(): void {
    this.api.getApiExterna().subscribe({
      next: (response) => {
        this.tasasMercado = response.data ?? [];
      },
      error: (error) => console.error('Error cargando tasas de mercado:', error),
    });
  }

  private generarTablaAmortizacion(): void {
    this.tabla = [];
    let saldo = this.totalPagar;

    for (let i = 1; i <= this.meses; i++) {
      saldo -= this.cuotaMensual;

      this.tabla.push({
        mes: i,
        cuota: this.cuotaMensual.toFixed(2),
        interes: (this.interesTotal / this.meses).toFixed(2),
        abono: (this.monto / this.meses).toFixed(2),
        saldo: Math.max(0, saldo).toFixed(2),
      });
    }
  }

  private calcularResumenHistorico(): void {
    if (this.historial.length === 0) {
      this.promedioCuota = 0;
      this.simulacionMayorInteres = null;
      this.comparacionCuota = '';
      return;
    }

    this.simulacionMayorInteres = this.historial.reduce((max, actual) => {
      return Number(actual.interes_total) > Number(max.interes_total) ? actual : max;
    }, this.historial[0]);

    const totalCuotas = this.historial.reduce((acc, item) => acc + Number(item.cuota_mensual), 0);
    this.promedioCuota = totalCuotas / this.historial.length;

    this.comparacionCuota = this.cuotaMensual
      ? (this.cuotaMensual > this.promedioCuota
          ? `Tu cuota actual ($${this.cuotaMensual.toFixed(2)}) está por encima del promedio histórico ($${this.promedioCuota.toFixed(2)}).`
          : this.cuotaMensual < this.promedioCuota
          ? `Tu cuota actual ($${this.cuotaMensual.toFixed(2)}) está por debajo del promedio histórico ($${this.promedioCuota.toFixed(2)}).`
          : `Tu cuota actual coincide con el promedio histórico ($${this.promedioCuota.toFixed(2)}).`)
      : '';
  }

  private actualizarGraficas(): void {
    this.actualizarGraficasLocales();
    this.actualizarGraficasHistorial();
  }

  private actualizarGraficasLocales(): void {
    const pieCanvas = document.getElementById('graficaCircular') as HTMLCanvasElement | null;
    const lineCanvas = document.getElementById('graficaLinea') as HTMLCanvasElement | null;

    if (!pieCanvas || !lineCanvas || !this.calculado) {
      return;
    }

    this.chartPieActual?.destroy();
    this.chartLineActual?.destroy();

    this.chartPieActual = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['Capital', 'Intereses'],
        datasets: [
          {
            data: [this.monto, this.interesTotal],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Capital vs. intereses de la simulación actual',
          },
        },
      },
    });

    this.chartLineActual = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: ['Mes 0', ...this.tabla.map((fila) => `Mes ${fila.mes}`)],
        datasets: [
          {
            label: 'Saldo pendiente',
            data: [this.totalPagar, ...this.tabla.map((fila) => Number(fila.saldo))],
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Proyección del saldo pendiente',
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  private actualizarGraficasHistorial(): void {
    const pieCanvas = document.getElementById('graficaCircularHistorial') as HTMLCanvasElement | null;
    const lineCanvas = document.getElementById('graficaLineaHistorial') as HTMLCanvasElement | null;

    if (!pieCanvas || !lineCanvas || this.historial.length === 0) {
      return;
    }

    this.chartPieHistorial?.destroy();
    this.chartLineHistorial?.destroy();

    const capitalTotal = this.historial.reduce((acc, item) => acc + Number(item.monto), 0);
    const interesesTotal = this.historial.reduce((acc, item) => acc + Number(item.interes_total), 0);

    this.chartPieHistorial = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['Capital acumulado', 'Intereses acumulados'],
        datasets: [
          {
            data: [capitalTotal, interesesTotal],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Acumulado histórico de simulaciones',
          },
        },
      },
    });

    const historialCronologico = [...this.historial].slice().reverse();

    this.chartLineHistorial = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: historialCronologico.map((item, index) => item.created_at ? new Date(item.created_at).toLocaleDateString() : `Sim. ${index + 1}`),
        datasets: [
          {
            label: 'Cuota mensual histórica',
            data: historialCronologico.map((item) => Number(item.cuota_mensual)),
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Evolución de cuotas en el tiempo',
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  private destruirGraficas(): void {
    this.chartPieActual?.destroy();
    this.chartLineActual?.destroy();
    this.chartPieHistorial?.destroy();
    this.chartLineHistorial?.destroy();

    this.chartPieActual = null;
    this.chartLineActual = null;
    this.chartPieHistorial = null;
    this.chartLineHistorial = null;
  }

  private resetEstado(): void {
    this.reporte = null;
    this.historial = [];
    this.tasasMercado = [];
    this.monto = 0;
    this.tasaMensual = 0;
    this.meses = 0;
    this.interesTotal = 0;
    this.totalPagar = 0;
    this.cuotaMensual = 0;
    this.riesgo = '';
    this.riesgoClase = '';
    this.calculado = false;
    this.tabla = [];
    this.promedioCuota = 0;
    this.simulacionMayorInteres = null;
    this.comparacionCuota = '';
    this.vistaActiva = 'simulador';
    this.destruirGraficas();
  }
}
