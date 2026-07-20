import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import joblib

def train():
    os.makedirs("model", exist_ok=True)
    
    # Load dataset
    csv_path = "dataset/patient_data.csv"
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}. Generating one now...")
        from dataset_generator import generate_dataset
        generate_dataset()
        
    data = pd.read_csv(csv_path)
    X = data.drop("Risk", axis=1)
    y = data["Risk"]
    
    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save the scaler
    scaler_path = "model/scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to {scaler_path}")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    
    # Build Keras neural network model
    model = Sequential([
        Dense(16, activation="relu", input_shape=(6,)),
        Dense(8, activation="relu"),
        Dense(1, activation="sigmoid")
    ])
    
    # Compile
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"]
    )
    
    # Train
    print("Starting TensorFlow training...")
    model.fit(
        X_train, y_train,
        epochs=50,       # Using 50 epochs to train quickly while achieving high accuracy
        batch_size=4,
        verbose=1
    )
    
    # Evaluate
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Model Accuracy on Test Set: {accuracy * 100:.2f}%")
    
    # Save model
    model_path = "model/cvd_model.keras"
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
if __name__ == "__main__":
    train()
