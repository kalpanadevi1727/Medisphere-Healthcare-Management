import joblib
import tensorflow as tf

model = tf.keras.models.load_model("model/cvd_model.keras")
scaler = joblib.load("model/scaler.pkl")

# Kalpanadevi D features:
# Age=19, BP=120, BMI=24.0, HbA1c=4.06, HeartRate=99, Cholesterol=212
features = [[19.0, 120.0, 24.0, 4.06, 99.0, 212.0]]
scaled = scaler.transform(features)
pred = model.predict(scaled)[0][0]
print(f"Prediction for Kalpanadevi D: {pred * 100:.6f}%")
