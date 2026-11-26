package com.skytrack.forecast.entity;

/**
 * Détails atmosphériques d'une prévision.
 * Sous-document embarqué dans {@link Forecast} (composition 1..1) : pas de collection propre.
 */
public class WeatherDetail {

    private Double temperature;
    private Double humidity;
    private Double windSpeed;
    private Double pressure;

    public WeatherDetail() {
    }

    public WeatherDetail(Double temperature, Double humidity, Double windSpeed, Double pressure) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.pressure = pressure;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Double getPressure() {
        return pressure;
    }

    public void setPressure(Double pressure) {
        this.pressure = pressure;
    }
}
