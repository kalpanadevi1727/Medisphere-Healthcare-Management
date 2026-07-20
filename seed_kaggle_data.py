import urllib.request
import json
import random
import time
from datetime import datetime, timedelta

def post_json(url, data):
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    json_data = json.dumps(data).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=json_data) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Error calling {url}: {e}")
        if hasattr(e, 'read'):
            print("Response:", e.read().decode("utf-8"))
        return None

# Realistic First Names and Last Names
FIRST_NAMES_MALE = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"]
FIRST_NAMES_FEMALE = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
STREETS = ["Oak St", "Pine St", "Maple Ave", "Cedar Rd", "Elm St", "View Rd", "Broadway", "Main St", "Hill Rd", "Lake Ave"]
CITIES = ["New York", "Chicago", "Boston", "San Francisco", "Austin", "Seattle", "Miami", "Denver"]
DISEASES = ["Diabetes", "Hypertension", "Cardiovascular Disease", "None", "Asthma"]
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

def generate_patient():
    gender = "Male" if random.random() > 0.5 else "Female"
    first = random.choice(FIRST_NAMES_MALE) if gender == "Male" else random.choice(FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    
    # Age distributed between 20 and 80
    age = random.randint(20, 80)
    dob = (datetime.now() - timedelta(days=age * 365.25 + random.randint(0, 365))).strftime("%Y-%m-%d")
    
    email = f"{first.lower()}.{last.lower()}{random.randint(10,99)}@example.com"
    phone = random.randint(6000000000, 9999999999)
    address = f"{random.randint(100, 999)} {random.choice(STREETS)}, {random.choice(CITIES)}"
    
    return {
        "firstname": first,
        "lastname": last,
        "gender": gender,
        "dob": dob,
        "email": email,
        "phoneno": phone,
        "address": address,
        "age": age # keeping track for correlating vitals
    }

def generate_vitals(patient_id, age, disease):
    # Correlate values based on age and disease (similar to Kaggle clinical data structures)
    if disease == "Hypertension" or disease == "Cardiovascular Disease" or age > 60:
        systolic = random.randint(135, 175)
        diastolic = random.randint(85, 105)
        heartbeat = random.randint(75, 95)
        cholesterol = random.randint(210, 280)
    else:
        systolic = random.randint(110, 125)
        diastolic = random.randint(70, 80)
        heartbeat = random.randint(60, 80)
        cholesterol = random.randint(150, 200)

    if disease == "Diabetes":
        blood_sugar = round(random.uniform(140.0, 250.0), 1)
        blood_glucose = round(random.uniform(7.0, 11.0), 1)
    else:
        blood_sugar = round(random.uniform(80.0, 120.0), 1)
        blood_glucose = round(random.uniform(4.5, 5.7), 1)
        
    oxygen = random.randint(95, 100) if random.random() > 0.05 else random.randint(91, 94)
    pulse = heartbeat
    
    return {
        "patientId": patient_id,
        "heartbeat": heartbeat,
        "bloodpressure": f"{systolic}/{diastolic}",
        "oxygenlevel": oxygen,
        "bloodsuger": blood_sugar,
        "pulserate": pulse,
        "bloodglucose": blood_glucose,
        "cholesterol": cholesterol,
        "bpm": heartbeat,
        "systolicbp": systolic
    }

def generate_healthtwin(patient_id, age, disease):
    # Correlate weight and height (to get realistic BMIs)
    height = round(random.uniform(150.0, 190.0), 1)
    if disease == "Cardiovascular Disease" or disease == "Diabetes" or random.random() > 0.6:
        bmi = random.uniform(28.0, 36.0) # overweight / obese
    else:
        bmi = random.uniform(19.0, 26.0) # normal
        
    weight = round(bmi * ((height / 100.0) ** 2), 1)
    
    # Body temperature in Fahrenheit (97.0 - 99.5 normal)
    temp = round(random.uniform(97.2, 99.1), 1)
    
    return {
        "patientId": patient_id,
        "bloodgroup": random.choice(BLOOD_GROUPS),
        "height": height,
        "weight": weight,
        "temperature": temp,
        "disease": disease
    }

def generate_consent(patient_id):
    granted = datetime.now() - timedelta(days=random.randint(10, 100))
    expiry = datetime.now() + timedelta(days=random.randint(180, 730))
    
    return {
        "patientId": patient_id,
        "consenttype": random.choice(["RESEARCH", "TREATMENT", "DATA_SHARING", "EMERGENCY_ONLY"]),
        "status": "APPROVED",
        "granteddate": granted.strftime("%Y-%m-%d"),
        "expirydate": expiry.strftime("%Y-%m-%d")
    }

def main():
    print("====================================================")
    print("      MediSphere Kaggle Dataset Seeder Script       ")
    print("====================================================")
    
    num_records = 25
    print(f"Generating and sending {num_records} realistic healthcare entries...")
    
    success_count = 0
    for i in range(num_records):
        print(f"\n[{i+1}/{num_records}] Generating patient...")
        patient_data = generate_patient()
        disease = random.choice(DISEASES)
        
        # Save Patient
        patient_resp = post_json("http://localhost:8081/patient/save", patient_data)
        if not patient_resp or "patientId" not in patient_resp:
            print("Failed to save patient. Are microservices running?")
            continue
            
        patient_id = patient_resp["patientId"]
        print(f"  -> Saved patient: {patient_data['firstname']} {patient_data['lastname']} (ID: {patient_id})")
        
        # Give a split second for the kafka message to create placeholder objects
        time.sleep(0.1)
        
        # Save Vitals
        vitals_data = generate_vitals(patient_id, patient_data["age"], disease)
        vitals_resp = post_json("http://localhost:8083/vitals/save", vitals_data)
        if vitals_resp:
            print(f"  -> Saved Vitals: BP={vitals_data['bloodpressure']}, HeartRate={vitals_data['heartbeat']}, Sugar={vitals_data['bloodsuger']}")
            
        # Save Health Twin
        twin_data = generate_healthtwin(patient_id, patient_data["age"], disease)
        twin_resp = post_json("http://localhost:8082/healthtwin/save", twin_data)
        if twin_resp:
            print(f"  -> Saved HealthTwin: BloodGroup={twin_data['bloodgroup']}, Disease={twin_data['disease']}, BMI={round(twin_data['weight']/((twin_data['height']/100)**2),1)}")
            
        # Save Consent
        consent_data = generate_consent(patient_id)
        consent_resp = post_json("http://localhost:8084/consent/save", consent_data)
        if consent_resp:
            print(f"  -> Saved Consent: Type={consent_data['consenttype']}, Status={consent_data['status']}")
            
        success_count += 1
        
    print("\n====================================================")
    print(f"Seeding completed! Successfully seeded {success_count} patients.")
    print("====================================================")

if __name__ == "__main__":
    main()
