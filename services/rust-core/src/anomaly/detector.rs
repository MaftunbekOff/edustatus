//! Statistical anomaly detection engine.
//!
//! Supports:
//!   - Z-score outlier detection (|z| > threshold)
//!   - IQR fence method (Tukey fences)
//!   - Velocity checks (transaction rate spike detection)
//!   - Moving average deviation

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyResult {
    pub is_anomaly: bool,
    pub score: f64,
    pub method: String,
    pub reason: Option<String>,
    pub severity: AnomalySeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AnomalySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataPoint {
    pub value: f64,
    pub timestamp_ms: Option<i64>,
}

pub struct AnomalyDetector {
    z_threshold: f64,
    iqr_multiplier: f64,
}

impl AnomalyDetector {
    pub fn new() -> Self {
        Self {
            z_threshold: 3.0,
            iqr_multiplier: 1.5,
        }
    }

    pub fn with_sensitivity(z_threshold: f64, iqr_multiplier: f64) -> Self {
        Self {
            z_threshold,
            iqr_multiplier,
        }
    }

    /// Z-score method: flags values more than `z_threshold` standard deviations from mean
    pub fn z_score(&self, values: &[f64], value: f64) -> AnomalyResult {
        if values.len() < 5 {
            return AnomalyResult {
                is_anomaly: false,
                score: 0.0,
                method: "z_score".into(),
                reason: Some("Insufficient data (need ≥5 points)".into()),
                severity: AnomalySeverity::Low,
            };
        }

        let n = values.len() as f64;
        let mean = values.iter().sum::<f64>() / n;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / n;
        let std_dev = variance.sqrt();

        if std_dev == 0.0 {
            return AnomalyResult {
                is_anomaly: value != mean,
                score: if value != mean { f64::INFINITY } else { 0.0 },
                method: "z_score".into(),
                reason: if value != mean { Some("Zero variance — value deviates".into()) } else { None },
                severity: AnomalySeverity::Medium,
            };
        }

        let z = (value - mean).abs() / std_dev;
        let is_anomaly = z > self.z_threshold;

        AnomalyResult {
            is_anomaly,
            score: z,
            method: "z_score".into(),
            reason: if is_anomaly {
                Some(format!("Z-score {:.2} exceeds threshold {:.1}", z, self.z_threshold))
            } else {
                None
            },
            severity: classify_severity(z / self.z_threshold),
        }
    }

    /// IQR (Tukey fences) method
    pub fn iqr(&self, mut values: Vec<f64>, value: f64) -> AnomalyResult {
        if values.len() < 4 {
            return AnomalyResult {
                is_anomaly: false,
                score: 0.0,
                method: "iqr".into(),
                reason: Some("Insufficient data".into()),
                severity: AnomalySeverity::Low,
            };
        }

        values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let q1 = percentile(&values, 25.0);
        let q3 = percentile(&values, 75.0);
        let iqr_val = q3 - q1;

        let lower = q1 - self.iqr_multiplier * iqr_val;
        let upper = q3 + self.iqr_multiplier * iqr_val;

        let is_anomaly = value < lower || value > upper;
        let distance = if value < lower {
            (lower - value) / iqr_val.max(f64::EPSILON)
        } else if value > upper {
            (value - upper) / iqr_val.max(f64::EPSILON)
        } else {
            0.0
        };

        AnomalyResult {
            is_anomaly,
            score: distance,
            method: "iqr".into(),
            reason: if is_anomaly {
                Some(format!(
                    "Value {:.2} outside fence [{:.2}, {:.2}]",
                    value, lower, upper
                ))
            } else {
                None
            },
            severity: classify_severity(distance),
        }
    }

    /// Velocity check: detects unusual transaction frequency in a time window
    pub fn velocity_check(
        &self,
        timestamps_ms: &[i64],
        window_ms: i64,
        max_count: usize,
    ) -> AnomalyResult {
        let now_ms = chrono::Utc::now().timestamp_millis();
        let count_in_window = timestamps_ms
            .iter()
            .filter(|&&t| now_ms - t <= window_ms)
            .count();

        let is_anomaly = count_in_window > max_count;
        let ratio = count_in_window as f64 / max_count as f64;

        AnomalyResult {
            is_anomaly,
            score: ratio,
            method: "velocity".into(),
            reason: if is_anomaly {
                Some(format!(
                    "{} events in {}s window (max {})",
                    count_in_window,
                    window_ms / 1000,
                    max_count
                ))
            } else {
                None
            },
            severity: classify_severity(ratio),
        }
    }

    /// Moving average deviation: checks if value deviates more than `threshold`% from moving avg
    pub fn moving_average_deviation(
        &self,
        values: &[f64],
        value: f64,
        window: usize,
        threshold_pct: f64,
    ) -> AnomalyResult {
        if values.len() < window {
            return AnomalyResult {
                is_anomaly: false,
                score: 0.0,
                method: "moving_avg".into(),
                reason: Some("Insufficient window data".into()),
                severity: AnomalySeverity::Low,
            };
        }

        let window_vals = &values[values.len() - window..];
        let avg = window_vals.iter().sum::<f64>() / window as f64;

        if avg == 0.0 {
            return AnomalyResult {
                is_anomaly: false,
                score: 0.0,
                method: "moving_avg".into(),
                reason: None,
                severity: AnomalySeverity::Low,
            };
        }

        let deviation_pct = ((value - avg) / avg).abs() * 100.0;
        let is_anomaly = deviation_pct > threshold_pct;

        AnomalyResult {
            is_anomaly,
            score: deviation_pct,
            method: "moving_avg".into(),
            reason: if is_anomaly {
                Some(format!(
                    "Deviation {:.1}% from moving average {:.2} (threshold: {}%)",
                    deviation_pct, avg, threshold_pct
                ))
            } else {
                None
            },
            severity: classify_severity(deviation_pct / threshold_pct),
        }
    }

    /// Combined analysis: runs all methods and returns the most severe result
    pub fn analyze(&self, historical: Vec<f64>, value: f64) -> Vec<AnomalyResult> {
        let mut results = Vec::new();
        results.push(self.z_score(&historical, value));
        results.push(self.iqr(historical.clone(), value));
        results.push(self.moving_average_deviation(&historical, value, historical.len().min(20), 50.0));
        results
    }
}

impl Default for AnomalyDetector {
    fn default() -> Self {
        Self::new()
    }
}

fn percentile(sorted: &[f64], pct: f64) -> f64 {
    let idx = (pct / 100.0) * (sorted.len() - 1) as f64;
    let lo = idx.floor() as usize;
    let hi = idx.ceil() as usize;
    if lo == hi {
        sorted[lo]
    } else {
        let frac = idx - lo as f64;
        sorted[lo] * (1.0 - frac) + sorted[hi] * frac
    }
}

fn classify_severity(ratio: f64) -> AnomalySeverity {
    match ratio {
        r if r < 1.5 => AnomalySeverity::Low,
        r if r < 2.5 => AnomalySeverity::Medium,
        r if r < 4.0 => AnomalySeverity::High,
        _ => AnomalySeverity::Critical,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_z_score_detects_outlier() {
        let detector = AnomalyDetector::new();
        let data: Vec<f64> = (1..=50).map(|x| x as f64).collect();
        let result = detector.z_score(&data, 1000.0);
        assert!(result.is_anomaly);
    }

    #[test]
    fn test_z_score_normal_value() {
        let detector = AnomalyDetector::new();
        let data: Vec<f64> = (1..=50).map(|x| x as f64).collect();
        let result = detector.z_score(&data, 25.0);
        assert!(!result.is_anomaly);
    }

    #[test]
    fn test_iqr_outlier() {
        let detector = AnomalyDetector::new();
        let data: Vec<f64> = (1..=20).map(|x| x as f64 * 10.0).collect();
        let result = detector.iqr(data, 5000.0);
        assert!(result.is_anomaly);
    }
}
