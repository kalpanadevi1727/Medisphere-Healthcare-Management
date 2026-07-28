package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "threshold_configs")
public class ThresholdConfig {

    @Id
    private String id;
    private int hrMax;
    private int spO2Min;
    private int systolicMax;
    private double sugarMax;

    public ThresholdConfig() {
    }

    public ThresholdConfig(String id, int hrMax, int spO2Min, int systolicMax, double sugarMax) {
        this.id = id;
        this.hrMax = hrMax;
        this.spO2Min = spO2Min;
        this.systolicMax = systolicMax;
        this.sugarMax = sugarMax;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getHrMax() {
        return hrMax;
    }

    public void setHrMax(int hrMax) {
        this.hrMax = hrMax;
    }

    public int getSpO2Min() {
        return spO2Min;
    }

    public void setSpO2Min(int spO2Min) {
        this.spO2Min = spO2Min;
    }

    public int getSystolicMax() {
        return systolicMax;
    }

    public void setSystolicMax(int systolicMax) {
        this.systolicMax = systolicMax;
    }

    public double getSugarMax() {
        return sugarMax;
    }

    public void setSugarMax(double sugarMax) {
        this.sugarMax = sugarMax;
    }
}
