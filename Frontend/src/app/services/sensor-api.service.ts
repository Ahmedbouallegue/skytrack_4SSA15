import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  MeasurementRequest,
  MeasurementStats,
  SensorMeasurement,
  Station,
  StationRequest
} from '../models/sensor.models';

@Injectable({ providedIn: 'root' })
export class SensorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.sensorApiUrl;

  listStations(cityId?: number): Observable<Station[]> {
    let params = new HttpParams();
    if (cityId !== undefined) params = params.set('cityId', cityId);
    return this.http.get<Station[]>(`${this.baseUrl}/stations`, { params });
  }

  createStation(request: StationRequest): Observable<Station> {
    return this.http.post<Station>(`${this.baseUrl}/stations`, request);
  }

  updateStation(id: string, request: Omit<StationRequest, 'id'>): Observable<Station> {
    return this.http.put<Station>(`${this.baseUrl}/stations/${encodeURIComponent(id)}`, request);
  }

  deleteStation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stations/${encodeURIComponent(id)}`);
  }

  listMeasurements(id: string, from: string, to: string, limit = 100): Observable<SensorMeasurement[]> {
    const params = new HttpParams().set('from', from).set('to', to).set('limit', limit);
    return this.http.get<SensorMeasurement[]>(
      `${this.baseUrl}/stations/${encodeURIComponent(id)}/measurements`, { params });
  }

  latestMeasurement(id: string): Observable<SensorMeasurement> {
    return this.http.get<SensorMeasurement>(
      `${this.baseUrl}/stations/${encodeURIComponent(id)}/measurements/latest`);
  }

  stats(id: string, from: string, to: string, window = '1h'): Observable<MeasurementStats[]> {
    const params = new HttpParams().set('from', from).set('to', to).set('window', window);
    return this.http.get<MeasurementStats[]>(
      `${this.baseUrl}/stations/${encodeURIComponent(id)}/measurements/stats`, { params });
  }

  createMeasurement(request: MeasurementRequest): Observable<SensorMeasurement> {
    return this.http.post<SensorMeasurement>(`${this.baseUrl}/measurements`, request);
  }
}
