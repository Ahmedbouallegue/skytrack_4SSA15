import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SensorApiService } from '../services/sensor-api.service';
import { MeasurementStats, SensorMeasurement, Station } from '../models/sensor.models';
import { Shell } from '../shared/shell/shell';

@Component({
  selector: 'app-station-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Shell],
  templateUrl: './station-detail.html',
  styleUrl: './station-detail.css'
})
export class StationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SensorApiService);
  protected stationId = '';
  protected station?: Station;
  protected readings: SensorMeasurement[] = [];
  protected statistics: MeasurementStats[] = [];
  protected latest?: SensorMeasurement;
  protected loading = true;
  protected error = '';
  protected sending = false;
  protected form = { temperature: 22 };
  protected range = '24h';

  ngOnInit(): void {
    this.stationId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  protected load(): void {
    this.loading = true;
    this.error = '';
    this.api.listStations().subscribe({
      next: (stations) => {
        this.station = stations.find((item) => item.id === this.stationId);
        if (!this.station) {
          this.error = 'This station could not be found.';
          this.loading = false;
          return;
        }
        this.refreshReadings();
      },
      error: () => { this.error = 'Could not connect to the sensor service.'; this.loading = false; }
    });
  }

  protected refreshReadings(): void {
    const to = new Date();
    const from = new Date(to.getTime() - (this.range === '7d' ? 7 : 1) * 86_400_000);
    this.api.listMeasurements(this.stationId, from.toISOString(), to.toISOString()).subscribe({
      next: (readings) => { this.readings = readings; this.loading = false; },
      error: () => { this.error = 'Readings are not available for this station yet.'; this.loading = false; }
    });
    this.api.latestMeasurement(this.stationId).subscribe({ next: (latest) => this.latest = latest });
    this.api.stats(this.stationId, from.toISOString(), to.toISOString()).subscribe({
      next: (statistics) => this.statistics = statistics
    });
  }

  protected sendMeasurement(): void {
    if (this.form.temperature < -90 || this.form.temperature > 60) return;
    this.sending = true;
    this.api.createMeasurement({ stationId: this.stationId, temperature: Number(this.form.temperature) }).subscribe({
      next: (measurement) => {
        this.latest = measurement;
        this.readings = [measurement, ...this.readings];
        this.sending = false;
      },
      error: (response: { error?: { message?: string } }) => {
        this.error = response.error?.message ?? 'Measurement could not be sent.';
        this.sending = false;
      }
    });
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }
}
