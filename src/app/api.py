import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adjust for your Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", "sys449420"),
        database=os.getenv("DB_NAME", "patient"),
    )

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

@app.post("/api/donations")
def create_donation(d: Donation):
    conn = get_db()
    try:
        cur = conn.cursor()
        args = [
            d.patient_name, d.blood_type, d.doctor_name, 
            d.date, d.time, d.blood_pressure, 
            d.symptoms, d.medical_history, d.contact_number,
            0,  # OUT p_donation_id (placeholder)
            ''  # OUT p_message (placeholder)
        ]
        
        result = cur.callproc('sp_insert_donation', args)
        
        # Get OUT parameters (last 2 values)
        donation_id = result[-2]
        message = result[-1]
        
        if donation_id == -1:
            raise HTTPException(status_code=400, detail=message)
        
        return {
            "status": "success",
            "donation_id": donation_id,
            "message": message
        }
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

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

class inventory(BaseModel):
    patient_name: str
    blood_type: str
    doctor_name: str
    date: str
    time: str
    blood_pressure: int
    symptoms: str
    medical_history: str
    contact_number: str

@app.post("/api/donations")
def create_inventory(d: Donation):
    conn = get_db()
    try:
        cur = conn.cursor()
        args = [
            d.patient_name, d.blood_type, d.doctor_name, 
            d.date, d.time, d.blood_pressure, 
            d.symptoms, d.medical_history, d.contact_number,
            0,  # OUT p_donation_id (placeholder)
            ''  # OUT p_message (placeholder)
        ]
        
        result = cur.callproc('sp_insert_donation', args)
        
        # Get OUT parameters (last 2 values)
        donation_id = result[-2]
        message = result[-1]
        
        if donation_id == -1:
            raise HTTPException(status_code=400, detail=message)
        
        return {
            "status": "success",
            "donation_id": donation_id,
            "message": message
        }
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

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