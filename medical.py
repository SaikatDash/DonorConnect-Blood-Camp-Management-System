import streamlit as st
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection function
def create_connection():
    try:
        # Get database port with error handling
        try:
            db_port = int(os.getenv('DB_PORT', 3306))
        except ValueError:
            st.warning(f"Invalid DB_PORT value. Using default port 3306.")
            db_port = 3306
        
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=db_port,
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'patient')
        )
        return connection
    except Error as e:
        st.error(f"Error connecting to database: {e}")
        st.info("Please ensure MySQL is running and database credentials are correctly configured in the .env file.")
        st.info("Copy .env.example to .env and update with your database credentials.")
        return None

# Function to insert data into database
def insert_donation_data(patient_name, blood_type, doctor_name, date, time, blood_pressure, symptoms, medical_history, contact_number):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
            INSERT INTO donation_records 
            (patient_name, blood_type, doctor_name, date, time, blood_pressure, symptoms, medical_history, contact_number)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (patient_name, blood_type, doctor_name, date, time, blood_pressure, symptoms, medical_history, contact_number))
            connection.commit()
            st.success("Data submitted successfully!")
            cursor.close()
        except Error as e:
            st.error(f"Error inserting data: {e}")
        finally:
            connection.close()
st.write("Blood Donation Camp Information")
with st.form(key = "Blood_Donation_Camp_Information"):
    st.text_input("Patient Name", key="patient_name")
    st.number_input("Age", min_value=0, max_value=120, key="age")
    st.text_input("Contact Number", key="contact_number")
    st.date_input("Date of Birth", key="date_of_birth")
    blood_type = ["O+","O-","A+","A-","B+","B-","AB+","AB-","Rh-null"]
    st.selectbox("Choose the Blood Type", blood_type, key="blood_type")
    st.text_input("Doctor Name", key="doctor_name")
    st.date_input("Date", key="date")
    st.time_input("Time", key="time")
    st.slider("Blood Pressure(hg)", min_value=200, max_value=600, value=200, step=1, key="blood_pressure")
    st.text_area("Symptoms", key="symptoms")
    st.text_area("Patient Medical History", key="patient_medical_history")
    submitted = st.form_submit_button(label="Submit")

if submitted:
    insert_donation_data(
        st.session_state.patient_name,
        st.session_state.blood_type,
        st.session_state.doctor_name,
        st.session_state.date.isoformat(),
        st.session_state.time.isoformat(),
        st.session_state.blood_pressure,
        st.session_state.symptoms,
        st.session_state.patient_medical_history,
        st.session_state.contact_number
    )