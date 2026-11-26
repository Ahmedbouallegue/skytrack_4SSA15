import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/">
          <span class="brand-mark">✦</span>
          <span><strong>skytrack</strong><small>weather intelligence</small></span>
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span>⌂</span> Overview
          </a>
          <a href="#stations"><span>◫</span> Stations</a>
          <a href="#ingest"><span>↗</span> Ingest data</a>
        </nav>
        <div class="sidebar-foot">
          <span class="pulse"></span>
          Sensor API online
          <small>localhost:8084</small>
        </div>
      </aside>
      <main class="content">
        <header class="topbar">
          <div class="mobile-brand"><span class="brand-mark">✦</span> skytrack</div>
          <div class="topbar-actions"><span class="date">{{ today }}</span><span class="avatar">A</span></div>
        </header>
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; background: #f4f7fb; color: #12233d; }
    .sidebar { width: 250px; flex: 0 0 250px; display: flex; flex-direction: column; padding: 30px 18px 22px; background: #0b1c35; color: #a8b8cf; }
    .brand { display: flex; align-items: center; gap: 11px; color: #fff; padding: 0 12px; }
    .brand strong { display: block; font-size: 20px; letter-spacing: -.05em; }
    .brand small { display: block; color: #7890ae; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
    .brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; color: #09213d; background: #5de0dc; font-size: 20px; }
    .nav { display: grid; gap: 7px; margin-top: 60px; }
    .nav a { display: flex; align-items: center; gap: 14px; padding: 13px 15px; border-radius: 10px; font-size: 13px; transition: .2s; }
    .nav a span { width: 18px; color: #6d8bab; font-size: 18px; text-align: center; }
    .nav a:hover, .nav a.active { color: #fff; background: #183250; }
    .nav a.active span { color: #5de0dc; }
    .sidebar-foot { margin-top: auto; padding: 14px; border: 1px solid #233b59; border-radius: 12px; color: #8ca2bc; font-size: 11px; }
    .sidebar-foot small { display: block; margin-top: 5px; color: #52708f; }
    .pulse { display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 50%; background: #4dddab; box-shadow: 0 0 0 4px #4dddab22; }
    .content { width: 100%; min-width: 0; }
    .topbar { display: flex; justify-content: space-between; align-items: center; height: 76px; padding: 0 5%; background: #fff; border-bottom: 1px solid #e8edf4; }
    .mobile-brand { display: none; }
    .topbar-actions { display: flex; align-items: center; gap: 20px; margin-left: auto; }
    .date { color: #8190a4; font-size: 12px; }
    .avatar { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: #fff; background: #183b62; font-weight: 700; }
    @media (max-width: 760px) {
      .sidebar { display: none; }
      .mobile-brand { display: flex; align-items: center; gap: 9px; color: #12233d; font-weight: 700; }
      .mobile-brand .brand-mark { width: 28px; height: 28px; font-size: 16px; }
      .date { display: none; }
    }
  `]
})
export class Shell {
  protected readonly today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
}
