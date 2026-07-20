import joblib
import tensorflow as tf
import numpy as np

# Load assets
model = tf.keras.models.load_model("model/cvd_model.keras")
scaler = joblib.load("model/scaler.pkl")

# Test 1: All zeros (representing casing mismatch where python gets 0 for all features)
features_zeros = [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
scaled_zeros = scaler.transform(features_zeros)
pred_zeros = model.predict(scaled_zeros)[0][0]
print(f"Prediction for All Zeros: {pred_zeros * 100:.2f}%")

# Test 2: Fallback values (representing no patient/vitals/healthtwin data)
# Age=45, BP=120, BMI=24.0, HbA1c=5.5, HeartRate=75, Cholesterol=221
features_fallback = [[45.0, 120.0, 24.0, 5.5, 75.0, 221.0]]
scaled_fallback = scaler.transform(features_fallback)
pred_fallback = model.predict(scaled_fallback)[0][0]
print(f"Prediction for Fallback Values: {pred_fallback * 100:.2f}%")

# Test 3: Normal healthy values
# Age=30, BP=115, BMI=21.0, HbA1c=5.2, HeartRate=70, Cholesterol=160
features_healthy = [[30.0, 115.0, 21.0, 5.2, 70.0, 160.0]]
scaled_healthy = scaler.transform(features_healthy)
pred_healthy = model.predict(scaled_healthy)[0][0]
print(f"Prediction for Healthy Values: {pred_healthy * 100:.2f}%")

# Test 4: High risk values
# Age=75, BP=160, BMI=35.0, HbA1c=9.5, HeartRate=115, Cholesterol=270
features_high = [[75.0, 160.0, 35.0, 9.5, 115.0, 270.0]]
scaled_high = scaler.transform(features_high)
pred_high = model.predict(scaled_high)[0][0]
print(f"Prediction for High Risk Values: {pred_high * 100:.2f}%")
