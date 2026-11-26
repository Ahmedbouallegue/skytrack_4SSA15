import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SensorApiService } from '../services/sensor-api.service';
import { Station } from '../models/sensor.models';
import { Shell } from '../shared/shell/shell';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Shell],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly api = inject(SensorApiService);
  protected stations: Station[] = [];
  protected loading = true;
  protected error = '';
  protected showCreate = false;
  protected saving = false;
  protected cityFilter: number | undefined;
  protected form = { id: '', cityId: 1, name: '' };

  ngOnInit(): void {
    this.loadStations();
  }

  protected loadStations(): void {
    this.loading = true;
    this.error = '';
    this.api.listStations(this.cityFilter).subscribe({
      next: (stations) => { this.stations = stations; this.loading = false; },
      error: () => { this.error = 'Could not load stations. Is the sensor service running on port 8084?'; this.loading = false; }
    });
  }

  protected createStation(): void {
    if (!this.form.id.trim() || !this.form.name.trim() || !this.form.cityId) return;
    this.saving = true;
    this.api.createStation({ id: this.form.id.trim(), cityId: Number(this.form.cityId), name: this.form.name.trim() }).subscribe({
      next: (station) => {
        this.stations = [...this.stations, station];
        this.form = { id: '', cityId: 1, name: '' };
        this.showCreate = false;
        this.saving = false;
      },
      error: (response: { error?: { message?: string } }) => {
        this.error = response.error?.message ?? 'Station could not be created.';
        this.saving = false;
      }
    });
  }

  protected removeStation(station: Station): void {
    if (!confirm(`Delete ${station.name}?`)) return;
    this.api.deleteStation(station.id).subscribe({
      next: () => { this.stations = this.stations.filter((item) => item.id !== station.id); },
      error: () => { this.error = 'The station could not be deleted.'; }
    });
  }
}
