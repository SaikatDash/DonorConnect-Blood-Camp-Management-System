import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mysql.connector
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """Connect to MySQL database using environment variables"""
    # Read from environment variables or use defaults
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),  # Must be set in environment
        database=os.getenv("DB_NAME", "patient"),
    )

def generate_next_id(cursor, table_name: str, id_column: str, prefix: str) -> str:
    """Generate next sequential ID like D001, C001, etc."""
    cursor.execute(f"SELECT MAX({id_column}) FROM {table_name}")
    result = cursor.fetchone()
    max_id = result[0] if result and result[0] else None
    
    if max_id:
        # Extract number from ID like "D001" -> 1
        num = int(max_id[1:]) + 1
    else:
        num = 1
    
    return f"{prefix}{str(num).zfill(3)}"

# Pydantic Models
class Donation(BaseModel):
    patient_name: str
    blood_type: str
    doctor_name: str
    date: str
    time: str
    blood_pressure: int
    symptoms: str
    medical_history: str
    contact_number: str

class Donor(BaseModel):
    name: str
    blood_group: str
    phone: str
    email: str
    city: str
    last_donation_date: str
    gender: str
    age: int

class Camp(BaseModel):
    title: str
    venue: str
    city: str
    date: str
    start_time: str
    end_time: str
    organizer: str
    capacity: int

class Inventory(BaseModel):
    blood_group: str
    units_available: int
    location: str
    camp_id: Optional[str] = None
    expiry_date: str

class EmergencyRequest(BaseModel):
    hospital_name: str
    blood_group: str
    units_needed: int
    city: str
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

class Appointment(BaseModel):
    patient_name: str
    doctor_name: str
    specialty: str
    date: str
    time: str
    reason: str
    phone: str

class StatusUpdate(BaseModel):
    status: str

class Doctor(BaseModel):
    name: str
    specialty: str
    phone: str
    email: str
    city: str

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

# ============ AUTHENTICATION ENDPOINTS ============
@app.post("/api/auth/login")
def login(request: LoginRequest):
    """Login endpoint - validates credentials"""
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE username = %s", (request.username,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Simple password check (in production, use hashed passwords)
        if user.get('password') != request.password:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        return {
            "status": "success",
            "token": f"token_{user.get('username')}",
            "username": user.get('username'),
            "role": user.get('role')
        }
    except mysql.connector.Error:
        # If users table doesn't exist, allow demo login
        if request.username == "admin" and request.password == "admin123":
            return {
                "status": "success",
                "token": "demo_token",
                "username": "admin",
                "role": "admin"
            }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        try:
            if cur:
                cur.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass

@app.post("/api/auth/register")
def register(request: RegisterRequest):
    """Register new user"""
    conn = get_db()
    try:
        cur = conn.cursor()
        
        # Check if username already exists
        cur.execute("SELECT id FROM users WHERE username = %s", (request.username,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Insert new user
        cur.execute(
            """
            INSERT INTO users (username, email, password, role)
            VALUES (%s, %s, %s, 'user')
            """,
            (request.username, request.email, request.password)
        )
        conn.commit()
        
        return {
            "status": "success",
            "token": f"token_{request.username}",
            "username": request.username,
            "role": "user"
        }
    except mysql.connector.Error as e:
        if "doesn't exist" in str(e):
            raise HTTPException(status_code=500, detail="Users table not created. Run database schema first.")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            cur.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

# ============ DONATION ENDPOINTS ============
@app.post("/api/donations")
def create_donation(d: Donation):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO donation_records
            (patient_name, blood_type, doctor_name, date, time, blood_pressure, symptoms, medical_history, contact_number)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (d.patient_name, d.blood_type, d.doctor_name, d.date, d.time, d.blood_pressure, d.symptoms, d.medical_history, d.contact_number),
        )
        conn.commit()
        return {"status": "success", "message": "Donation record created"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ============ DONOR ENDPOINTS ============
@app.get("/api/donors")
def list_donors():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT donor_id, name, blood_group, phone, email, city, last_donation_date, gender, age FROM donors")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/donors")
def create_donor(donor: Donor):
    conn = get_db()
    try:
        cur = conn.cursor()
        donor_id = generate_next_id(cur, "donors", "donor_id", "D")
        cur.execute(
            """
            INSERT INTO donors (donor_id, name, blood_group, phone, email, city, last_donation_date, gender, age)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (donor_id, donor.name, donor.blood_group, donor.phone, donor.email, donor.city, donor.last_donation_date, donor.gender, donor.age),
        )
        conn.commit()
        return {"status": "success", "donor_id": donor_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            cur.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

# ============ CAMP ENDPOINTS ============
@app.get("/api/camps")
def list_camps():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT camp_id, title, venue, city, date, start_time, end_time, organizer, capacity, registered FROM camps")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/camps")
def create_camp(camp: Camp):
    conn = get_db()
    try:
        cur = conn.cursor()
        camp_id = generate_next_id(cur, "camps", "camp_id", "C")
        cur.execute(
            """
            INSERT INTO camps (camp_id, title, venue, city, date, start_time, end_time, organizer, capacity, registered)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
            """,
            (camp_id, camp.title, camp.venue, camp.city, camp.date, camp.start_time, camp.end_time, camp.organizer, camp.capacity),
        )
        conn.commit()
        return {"status": "success", "camp_id": camp_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            cur.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

# ============ INVENTORY ENDPOINTS ============
@app.get("/api/inventory")
def list_inventory():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT inventory_id, blood_group, units_available, location, camp_id, expiry_date FROM blood_inventory")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ============ DOCTORS MASTER ENDPOINTS ============
@app.get("/api/doctors")
def list_doctors():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT doctor_id, name, specialty, phone, email, city
            FROM doctors
        """)
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/doctors")
def create_doctor(doctor: Doctor):
    conn = get_db()
    try:
        cur = conn.cursor()
        doctor_id = generate_next_id(cur, "doctors", "doctor_id", "T")
        cur.execute(
            """
            INSERT INTO doctors (doctor_id, name, specialty, phone, email, city)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (doctor_id, doctor.name, doctor.specialty, doctor.phone, doctor.email, doctor.city),
        )
        conn.commit()
        return {"status": "success", "doctor_id": doctor_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/inventory")
def create_inventory(item: Inventory):
    conn = get_db()
    try:
        cur = conn.cursor()
        inventory_id = generate_next_id(cur, "blood_inventory", "inventory_id", "I")
        cur.execute(
            """
            INSERT INTO blood_inventory (inventory_id, blood_group, units_available, location, camp_id, expiry_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (inventory_id, item.blood_group, item.units_available, item.location, item.camp_id, item.expiry_date),
        )
        conn.commit()
        return {"status": "success", "inventory_id": inventory_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ============ EMERGENCY REQUEST ENDPOINTS ============
@app.get("/api/emergency-requests")
def list_emergency_requests():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT request_id, hospital_name, blood_group, units_needed, city, status, created_at, contact_phone, contact_email FROM emergency_requests")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/emergency-requests")
def create_emergency_request(req: EmergencyRequest):
    conn = get_db()
    try:
        cur = conn.cursor()
        request_id = generate_next_id(cur, "emergency_requests", "request_id", "R")
        cur.execute(
            """
            INSERT INTO emergency_requests (request_id, hospital_name, blood_group, units_needed, city, status, contact_phone, contact_email)
            VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s)
            """,
            (request_id, req.hospital_name, req.blood_group, req.units_needed, req.city, req.contact_phone, req.contact_email),
        )
        conn.commit()
        return {"status": "success", "request_id": request_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/emergency-requests/{request_id}/status")
def update_emergency_request_status(request_id: str, update: StatusUpdate):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE emergency_requests SET status = %s WHERE request_id = %s", (update.status, request_id))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ============ CHATBOT ENDPOINTS ============
class ChatbotRequest(BaseModel):
    message: str

@app.post("/api/chatbot")
def chat(request: ChatbotRequest):
    """Chatbot endpoint - processes user messages and returns AI responses"""
    try:
        try:
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY", "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")
            
            # Use newer API format if available
            if hasattr(openai, 'ChatCompletion'):
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": request.message}],
                    max_tokens=150,
                    temperature=0.7
                )
                return {
                    "status": "success",
                    "response": response.choices[0].message.content.strip()
                }
            else:
                response = openai.Completion.create(
                    model="text-davinci-003",
                    prompt=request.message,
                    max_tokens=150,
                    temperature=0.7
                )
                return {
                    "status": "success",
                    "response": response['choices'][0]['text'].strip()
                }
        except Exception as openai_error:
            # Fallback response if OpenAI fails
            return {
                "status": "success",
                "response": f"I understood your request: {request.message[:50]}... Please check the DonorConnect system."
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ============ APPOINTMENT ENDPOINTS ============
@app.get("/api/appointments")
def list_appointments():
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT appointment_id, patient_name, doctor_name, specialty, date, time, status, reason, phone FROM appointments")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

@app.post("/api/appointments")
def create_appointment(apt: Appointment):
    conn = get_db()
    try:
        cur = conn.cursor()
        appointment_id = generate_next_id(cur, "appointments", "appointment_id", "A")
        cur.execute(
            """
            INSERT INTO appointments (appointment_id, patient_name, doctor_name, specialty, date, time, status, reason, phone)
            VALUES (%s, %s, %s, %s, %s, %s, 'scheduled', %s, %s)
            """,
            (appointment_id, apt.patient_name, apt.doctor_name, apt.specialty, apt.date, apt.time, apt.reason, apt.phone),
        )
        conn.commit()
        return {"status": "success", "appointment_id": appointment_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, update: StatusUpdate):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE appointments SET status = %s WHERE appointment_id = %s", (update.status, appointment_id))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
