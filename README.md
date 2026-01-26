<h1 align="center">
  DonorConnect 🩸  
</h1>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=E32636&center=true&vCenter=true&width=700&lines=Blood+Donation+Camp+%26+Inventory+Management+System;Connect+Donors%2C+Camps+%26+Hospitals;Built+to+save+lives+with+better+data" />
</p>

<p align="center">
  <img src="https://iam-weijie.github.io/wave/hand-emoji.svg" alt="Hi" width="50" height="50" />
</p>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&color=28a745" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Platform-Strealit-blue?style=for-the-badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge" />
  </a>
</p>

---

## 🎬 Live Preview (Demo)


<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTFqZ25uZDFwZ2ZoY3N2b2NrN3IxNjV4bGZqZzNpaTFvN2F2ZGIxZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZVik7pBtu9dNS/giphy.gif" 
       alt="App Demo" width="650" />
</p>

---

## 🚀 Overview

DonorConnect is a **Blood Donation Camp & Inventory Management System** that helps NGOs, hospitals, and organizers manage donors, camps, and blood units in a structured database.  
It focuses on **fast donor search, smart camp scheduling, and real-time blood stock visibility**.

---

## ✨ Key Features

- 🧑‍🤝‍🧑 **Donor Management** – Register donors with blood group, location, contact, and last donation date.  
- 🏥 **Camp Management** – Create and manage blood donation camps with venue, date, time, and capacity.  
- 🩸 **Blood Inventory Tracking** – Track collected units by blood group, camp, and expiry date.  
- 🔍 **Smart Search** – Find donors or available blood by blood group, city, and recent donation history.  
- 🚨 **Emergency Broadcast** – Quickly list matching donors for urgent requests from hospitals.  
- 📊 **Analytics Dashboard** – Visualize total units collected per camp, blood group, and month/season.
- **Doctor Appointment System** - Smart Doctor Appointment & Scheduling System


---

## 🧱 Tech Stack

- **Frontend**: HTML,Streamlit
- **Backend**: Python
- **Database**: MySQL  
- **Tools**: VS Code, Git, GitHub  

> 🔧 Replace the stack above with your actual technologies.

---

## 🗄️ Database Design (High-Level)

**Main tables:**

- `donors` – donor_id, name, blood_group, phone, email, city, last_donation_date, gender, age  
- `camps` – camp_id, title, venue, city, date, start_time, end_time, organizer  
- `donations` – donation_id, donor_id, camp_id, units, donation_date  
- `blood_inventory` – inventory_id, blood_group, units_available, camp_id / location, expiry_date  
- `requests` – request_id, hospital_name, blood_group, units_needed, city, status, created_at  

> ER diagrams

---
##Implementations
1.**Web Page integration**:Using HTML, CSS and Streamlit for different pages to done the Web View.
2. **Database Functioning**: used MYSQL different commands like : DDL,DML and Procedure, Function for better database implementation in this website.
---




---

## 🎯 Core Workflows

1. **Donor Registration**  
   - Donor signs up → record stored in `donors` table.  
   - System checks eligibility window before next donation.

2. **Camp Creation & Management**  
   - Admin schedules a new camp and links it to a city and organizer.  
   - On camp day, donors are checked-in and their donations recorded.

3. **Blood Stock & Requests**  
   - After a camp, units collected are logged into `blood_inventory`.  
   - When a hospital requests blood, system filters inventory & donor list.

---


## 📸 UI Snapshots

> Add your real screenshots or animated GIFs here.

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Dashboard+View" alt="Dashboard" />
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Donor+Management+Screen" alt="Donor Management" />
</p>

---

## 🧪 Future Enhancements

- 🔔 Email/SMS reminders when a donor becomes eligible again.  
- 📍 Location-based camp suggestions using maps.  
- 🔐 Role-based access for admins, staff, and donors.  
- 📈 Advanced analytics for donor retention and camp performance.
- AI chatbot Implementation


---

## 📂 Project Setup

### Prerequisites
- Python 3.7 or higher
- MySQL Server 5.7 or higher

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/SaikatDash/DonorConnect-Blood-Camp-Management-System.git
cd DonorConnect-Blood-Camp-Management-System

# 2. Install required Python packages
pip install -r requirements.txt

# 3. Set up MySQL database
# - Ensure MySQL server is running
# - Create a database named 'patient' (or your preferred name)
# - Create the required table:

CREATE DATABASE IF NOT EXISTS patient;
USE patient;

CREATE TABLE IF NOT EXISTS donation_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255),
    blood_type VARCHAR(10),
    doctor_name VARCHAR(255),
    date DATE,
    time TIME,
    blood_pressure INT,
    symptoms TEXT,
    medical_history TEXT,
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# 4. Configure database connection
# Copy the example environment file and update with your database credentials
cp .env.example .env

# Edit .env file with your database credentials:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=patient

# 5. Run the Streamlit application
streamlit run medical.py
# or
python -m streamlit run medical.py
```

### Troubleshooting

**Error: Can't connect to MySQL server**
- Ensure MySQL server is running: `sudo systemctl start mysql` (Linux) or start MySQL from Services (Windows)
- Verify your database credentials in the `.env` file
- Check that the database 'patient' exists
- Ensure MySQL is listening on the correct port (default 3306)

**Module not found errors**
- Run `pip install -r requirements.txt` to install all dependencies


