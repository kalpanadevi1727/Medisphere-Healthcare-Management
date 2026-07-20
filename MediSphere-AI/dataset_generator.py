import os
import csv
import random
import math

def generate_dataset(num_records=1200):
    os.makedirs("dataset", exist_ok=True)
    filepath = "dataset/patient_data.csv"
    
    headers = ["Age", "BP", "BMI", "HbA1c", "HeartRate", "Cholesterol", "Risk"]
    
    with open(filepath, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for _ in range(num_records):
            # Generate feature values
            age = random.randint(18, 85)
            bp = random.randint(90, 180)  # Systolic Blood Pressure
            bmi = round(random.uniform(16.0, 42.0), 1)
            hba1c = round(random.uniform(4.0, 12.0), 1)  # HbA1c level
            heart_rate = random.randint(55, 125)
            cholesterol = random.randint(130, 290)
            
            # Compute a weighted risk score (similar to clinical guidelines)
            score = 0
            if age > 60:
                score += 15
            if bp > 140:
                score += 20
            if bmi > 30:
                score += 15
            if hba1c > 7:
                score += 20
            if cholesterol > 220:
                score += 20
            if heart_rate > 110:
                score += 10
                
            # Convert score to a probability using a sigmoid function centered around score=40
            # This introduces natural noise so the model isn't perfectly deterministic
            probability = 1 / (1 + math.exp(-(score - 40) / 10.0))
            risk = 1 if random.random() < probability else 0
            
            writer.writerow([age, bp, bmi, hba1c, heart_rate, cholesterol, risk])
            
    print(f"Dataset generated successfully at {filepath} with {num_records} records.")

if __name__ == "__main__":
    generate_dataset()
