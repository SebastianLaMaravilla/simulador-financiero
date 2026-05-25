import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SimulationRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  monto: number;
  tasa_mensual: number;
  meses: number;
  interes_total: number;
  total_pagar: number;
  cuota_mensual: number;
  riesgo: string;
  created_at: string;
}

export interface DashboardReport {
  total_registros: number;
  ultimo_registro: string | null;
}

export interface MarketRate {
  entidad: string;
  tasa_mensual: number;
  tipo: string;
  moneda: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  message?: string;
  data?: T;
}

export interface SimulationPayload {
  user_id: string;
  user_name: string;
  user_email: string;
  monto: number;
  tasa_mensual: number;
  meses: number;
  interes_total: number;
  total_pagar: number;
  cuota_mensual: number;
  riesgo: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly url = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  guardarSimulacion(payload: SimulationPayload) {
  return this.http.post<ApiResponse>(`${this.url}/simulaciones`, payload);
}

  getHistorial(uid: string) {
  return this.http.get<ApiResponse<SimulationRecord[]>>(
   `${this.url}/simulaciones?uid=${encodeURIComponent(uid)}`
  );
}

  getReporte(uid: string) {
  return this.http.get<ApiResponse<DashboardReport>>(
    `${this.url}/reporte?uid=${encodeURIComponent(uid)}`
  );
}



  //getEstadisticas(uid: string) {
    //return this.http.get<ApiResponse>(`${this.url}/estadisticas?uid=${encodeURIComponent(uid)}`);
  //}

  getApiExterna() {
    return this.http.get<ApiResponse<MarketRate[]>>(`${this.url}/mercado`);
  }
}
