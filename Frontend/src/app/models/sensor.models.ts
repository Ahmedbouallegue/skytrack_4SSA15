export interface Station {
  id: string;
  cityId: number;
  name: string;
}

export interface StationRequest {
  id: string;
  cityId: number;
  name: string;
}

export interface SensorMeasurement {
  stationId: string;
  temperature: number;
  timestamp: string;
}

export interface MeasurementRequest {
  stationId: string;
  temperature: number;
  timestamp?: string;
}

export interface MeasurementStats {
  windowStart: string;
  windowEnd: string;
  temperatureMin: number;
  temperatureMax: number;
  temperatureMean: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
