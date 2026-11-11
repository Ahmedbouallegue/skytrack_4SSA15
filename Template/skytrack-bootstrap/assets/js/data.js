/* =====================================================================
   SkyTrack — mock data
   ---------------------------------------------------------------------
   Field names mirror the entities of each microservice, so this file
   can be replaced one block at a time by real REST calls.
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Location Service :8081 — Region ↔ City ---- */
  const regions = [
    { id: 1, name: "Grand Tunis", country: "Tunisie" },
    { id: 2, name: "Sahel", country: "Tunisie" },
    { id: 3, name: "Nord", country: "Tunisie" },
    { id: 4, name: "Sud", country: "Tunisie" },
    { id: 5, name: "Centre", country: "Tunisie" },
  ];

  const cities = [
    { id: 1, name: "Tunis", latitude: 36.8065, longitude: 10.1815, regionId: 1 },
    { id: 2, name: "Ariana", latitude: 36.8625, longitude: 10.1956, regionId: 1 },
    { id: 3, name: "Sousse", latitude: 35.8256, longitude: 10.6084, regionId: 2 },
    { id: 4, name: "Monastir", latitude: 35.7643, longitude: 10.8113, regionId: 2 },
    { id: 5, name: "Bizerte", latitude: 37.2744, longitude: 9.8739, regionId: 3 },
    { id: 6, name: "Tabarka", latitude: 36.9544, longitude: 8.7580, regionId: 3 },
    { id: 7, name: "Sfax", latitude: 34.7406, longitude: 10.7603, regionId: 4 },
    { id: 8, name: "Gabès", latitude: 33.8815, longitude: 10.0982, regionId: 4 },
    { id: 9, name: "Tozeur", latitude: 33.9197, longitude: 8.1335, regionId: 4 },
    { id: 10, name: "Kairouan", latitude: 35.6781, longitude: 10.0963, regionId: 5 },
  ];

  /* ---- User Service :8080 (.NET) — Role ↔ User ---- */
  const roles = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "FORECASTER" },
    { id: 3, name: "USER" },
  ];

  const users = [
    { id: 1, username: "ahmed.b", email: "ahmed.bouallegue@skytrack.tn", roleId: 1, active: true, lastLogin: "2026-11-11T08:42:00" },
    { id: 2, username: "dhia.a", email: "dhia.allagui@skytrack.tn", roleId: 2, active: true, lastLogin: "2026-11-11T09:15:00" },
    { id: 3, username: "yasmine.f", email: "yasmine.fehri@skytrack.tn", roleId: 2, active: true, lastLogin: "2026-11-10T17:03:00" },
    { id: 4, username: "salim.k", email: "salim.khaldi@skytrack.tn", roleId: 1, active: true, lastLogin: "2026-11-11T07:58:00" },
    { id: 5, username: "yassine.w", email: "yassine.wesslati@skytrack.tn", roleId: 3, active: true, lastLogin: "2026-11-09T21:40:00" },
    { id: 6, username: "abdallah.g", email: "abdallah.grissa@skytrack.tn", roleId: 3, active: false, lastLogin: "2026-10-28T12:10:00" },
    { id: 7, username: "meriem.t", email: "meriem.trabelsi@gmail.com", roleId: 3, active: true, lastLogin: "2026-11-11T06:22:00" },
    { id: 8, username: "karim.h", email: "karim.haddad@outlook.com", roleId: 3, active: true, lastLogin: "2026-11-08T19:05:00" },
  ];

  /* ---- Forecast Service :8082 — Forecast ⊃ WeatherDetail (embedded) ---- */
  const forecasts = [
    { id: "6731f0a1c2e4", cityId: 1, date: "2026-11-11", summary: "Ensoleillé", weatherDetail: { temperature: 22.4, humidity: 58, windSpeed: 14, pressure: 1016 } },
    { id: "6731f0a1c2e5", cityId: 3, date: "2026-11-11", summary: "Partiellement nuageux", weatherDetail: { temperature: 23.1, humidity: 64, windSpeed: 18, pressure: 1014 } },
    { id: "6731f0a1c2e6", cityId: 5, date: "2026-11-11", summary: "Averses", weatherDetail: { temperature: 18.6, humidity: 81, windSpeed: 26, pressure: 1008 } },
    { id: "6731f0a1c2e7", cityId: 7, date: "2026-11-11", summary: "Ensoleillé", weatherDetail: { temperature: 24.8, humidity: 52, windSpeed: 12, pressure: 1017 } },
    { id: "6731f0a1c2e8", cityId: 9, date: "2026-11-11", summary: "Vent de sable", weatherDetail: { temperature: 27.3, humidity: 21, windSpeed: 46, pressure: 1011 } },
    { id: "6731f0a1c2e9", cityId: 6, date: "2026-11-11", summary: "Orageux", weatherDetail: { temperature: 16.9, humidity: 88, windSpeed: 34, pressure: 1002 } },
    { id: "6731f0a1c2ea", cityId: 10, date: "2026-11-11", summary: "Nuageux", weatherDetail: { temperature: 21.0, humidity: 47, windSpeed: 15, pressure: 1015 } },
    { id: "6731f0a1c2eb", cityId: 1, date: "2026-11-12", summary: "Partiellement nuageux", weatherDetail: { temperature: 21.2, humidity: 62, windSpeed: 17, pressure: 1013 } },
    { id: "6731f0a1c2ec", cityId: 8, date: "2026-11-12", summary: "Ensoleillé", weatherDetail: { temperature: 25.6, humidity: 49, windSpeed: 20, pressure: 1015 } },
    { id: "6731f0a1c2ed", cityId: 4, date: "2026-11-12", summary: "Pluie légère", weatherDetail: { temperature: 20.4, humidity: 76, windSpeed: 22, pressure: 1009 } },
    { id: "6731f0a1c2ee", cityId: 2, date: "2026-11-12", summary: "Averses", weatherDetail: { temperature: 19.3, humidity: 79, windSpeed: 24, pressure: 1007 } },
    { id: "6731f0a1c2ef", cityId: 5, date: "2026-11-13", summary: "Orageux", weatherDetail: { temperature: 17.1, humidity: 86, windSpeed: 38, pressure: 1001 } },
  ];

  // 7-day outlook for the dashboard (Tunis)
  const week = [
    { day: "Auj.", wx: "sun", hi: 23, lo: 15, rain: 0 },
    { day: "jeu.", wx: "cloud-sun", hi: 21, lo: 14, rain: 10 },
    { day: "ven.", wx: "rain", hi: 18, lo: 13, rain: 70 },
    { day: "sam.", wx: "storm", hi: 17, lo: 12, rain: 85 },
    { day: "dim.", wx: "cloud", hi: 19, lo: 12, rain: 30 },
    { day: "lun.", wx: "cloud-sun", hi: 21, lo: 13, rain: 10 },
    { day: "mar.", wx: "sun", hi: 23, lo: 14, rain: 0 },
  ];

  /* ---- Alert & Notification Service :8083 — Alert 1..* Notification ---- */
  const alerts = [
    { id: "a-1042", cityId: 6, type: "Orage", severity: "CRITICAL", createdAt: "2026-11-11T08:05:00", active: true, message: "Orages violents attendus, rafales jusqu’à 90 km/h." },
    { id: "a-1041", cityId: 9, type: "Vent de sable", severity: "SERIOUS", createdAt: "2026-11-11T07:20:00", active: true, message: "Visibilité réduite à moins de 1 km l’après-midi." },
    { id: "a-1040", cityId: 5, type: "Fortes pluies", severity: "SERIOUS", createdAt: "2026-11-11T06:48:00", active: true, message: "Cumuls de 40 à 60 mm en 12 h." },
    { id: "a-1039", cityId: 7, type: "Chaleur", severity: "WARNING", createdAt: "2026-11-10T14:10:00", active: true, message: "Températures au-dessus des normales saisonnières." },
    { id: "a-1038", cityId: 3, type: "Houle", severity: "WARNING", createdAt: "2026-11-10T09:30:00", active: false, message: "Mer agitée, vagues de 2 à 3 m." },
    { id: "a-1037", cityId: 1, type: "Brouillard", severity: "WARNING", createdAt: "2026-11-09T05:55:00", active: false, message: "Brouillard dense en début de matinée." },
  ];

  const notifications = [
    { id: "n-5521", alertId: "a-1042", userId: 2, message: "Alerte orage — Tabarka", read: false, sentAt: "2026-11-11T08:06:00" },
    { id: "n-5520", alertId: "a-1041", userId: 2, message: "Vent de sable — Tozeur", read: false, sentAt: "2026-11-11T07:21:00" },
    { id: "n-5519", alertId: "a-1040", userId: 2, message: "Fortes pluies — Bizerte", read: false, sentAt: "2026-11-11T06:49:00" },
    { id: "n-5518", alertId: "a-1039", userId: 2, message: "Chaleur — Sfax", read: true, sentAt: "2026-11-10T14:11:00" },
    { id: "n-5517", alertId: "a-1038", userId: 2, message: "Houle — Sousse", read: true, sentAt: "2026-11-10T09:31:00" },
  ];

  /* ---- IoT Sensor Service :8084 — Station 1..* SensorMeasurement ---- */
  const stations = [
    { stationId: "ST-TUN-01", name: "Tunis-Carthage", cityId: 1, online: true, last: { temperature: 22.1, humidity: 59, rain: 0.0 }, seenAgo: "il y a 12 s" },
    { stationId: "ST-SFX-01", name: "Sfax Thyna", cityId: 7, online: true, last: { temperature: 24.6, humidity: 51, rain: 0.0 }, seenAgo: "il y a 8 s" },
    { stationId: "ST-BZT-02", name: "Bizerte Port", cityId: 5, online: true, last: { temperature: 18.4, humidity: 83, rain: 2.6 }, seenAgo: "il y a 21 s" },
    { stationId: "ST-SOU-01", name: "Sousse Corniche", cityId: 3, online: true, last: { temperature: 22.9, humidity: 66, rain: 0.2 }, seenAgo: "il y a 15 s" },
    { stationId: "ST-TOZ-01", name: "Tozeur Nefta", cityId: 9, online: true, last: { temperature: 27.0, humidity: 20, rain: 0.0 }, seenAgo: "il y a 9 s" },
    { stationId: "ST-TAB-01", name: "Tabarka Côte", cityId: 6, online: false, last: { temperature: 17.2, humidity: 87, rain: 5.1 }, seenAgo: "il y a 14 min" },
  ];

  /* ---- Analytics & Preferences Service :8085 ---- */
  const months = ["déc.", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov."];
  const historicalLogs = {
    // cityId -> monthly avgTemperature / avgHumidity (period = month)
    1: { avgTemperature: [12.6, 11.4, 12.1, 14.2, 16.8, 20.9, 25.1, 28.4, 28.9, 25.8, 21.7, 17.0], avgHumidity: [74, 76, 72, 70, 67, 63, 58, 55, 57, 63, 68, 72] },
    7: { avgTemperature: [13.8, 12.3, 13.4, 15.9, 18.6, 22.1, 25.9, 28.2, 28.8, 26.6, 22.9, 18.2], avgHumidity: [66, 67, 65, 64, 63, 64, 64, 64, 65, 66, 65, 66] },
    9: { avgTemperature: [12.0, 11.0, 13.3, 17.1, 21.3, 26.4, 31.2, 34.1, 33.6, 29.0, 22.6, 16.3], avgHumidity: [56, 57, 50, 44, 38, 33, 29, 27, 31, 41, 48, 55] },
  };

  const userPreference = { id: "p-0002", userId: 2, unit: "CELSIUS", alertsEnabled: true };

  /* ---- Platform / infrastructure ---- */
  const services = [
    { key: "user", name: "User Service", tech: ".NET", port: 8080, db: "PostgreSQL :5432", icon: "bi-people", status: "UP", latency: 38 },
    { key: "location", name: "Location Service", tech: "Spring Boot", port: 8081, db: "PostgreSQL :5433", icon: "bi-geo-alt", status: "UP", latency: 24 },
    { key: "forecast", name: "Forecast Service", tech: "Spring Boot", port: 8082, db: "MongoDB :27017", icon: "bi-cloud-sun", status: "UP", latency: 31 },
    { key: "alert", name: "Alert & Notification", tech: "Spring Boot", port: 8083, db: "MongoDB :27018", icon: "bi-bell", status: "UP", latency: 45 },
    { key: "iot", name: "IoT Sensor", tech: "Spring Boot", port: 8084, db: "InfluxDB :8086", icon: "bi-broadcast", status: "DEGRADED", latency: 212 },
    { key: "analytics", name: "Analytics & Preferences", tech: "Spring Boot", port: 8085, db: "InfluxDB + MongoDB", icon: "bi-graph-up", status: "UP", latency: 52 },
  ];

  /* ---- helpers ---- */
  const byId = (list, id) => list.find((x) => x.id === id);
  const cityName = (id) => (byId(cities, id) || {}).name || "—";
  const regionName = (id) => (byId(regions, id) || {}).name || "—";
  const roleName = (id) => (byId(roles, id) || {}).name || "—";

  // Deterministic pseudo-random series so charts look real but stay stable
  function series(seed, n, base, amp, noise, phase) {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) - 0.5;
    return Array.from({ length: n }, (_, i) => {
      const v = base + amp * Math.sin(((i / n) * 2 * Math.PI) - (phase || 0)) + rnd() * noise;
      return Math.round(v * 10) / 10;
    });
  }

  window.SkyData = {
    regions, cities, roles, users, forecasts, week, alerts, notifications, stations,
    months, historicalLogs, userPreference, services,
    cityName, regionName, roleName, series,
  };
})();
