package com.skytrack.forecast.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Bulletin de prévision météo (collection MongoDB "forecasts").
 * - weatherDetail : sous-document embarqué (composition 1..1).
 * - cityId : lien logique vers City du Location Service (pas de clé étrangère).
 */
@Document(collection = "forecasts")
public class Forecast {

    @Id
    private String id;

    @Indexed
    private Long cityId;

    private LocalDate date;
    private String summary;
    private WeatherDetail weatherDetail;

    public Forecast() {
    }

    public Forecast(Long cityId, LocalDate date, String summary, WeatherDetail weatherDetail) {
        this.cityId = cityId;
        this.date = date;
        this.summary = summary;
        this.weatherDetail = weatherDetail;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public WeatherDetail getWeatherDetail() {
        return weatherDetail;
    }

    public void setWeatherDetail(WeatherDetail weatherDetail) {
        this.weatherDetail = weatherDetail;
    }
}
