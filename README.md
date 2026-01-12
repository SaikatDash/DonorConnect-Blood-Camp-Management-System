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
    <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" />
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

## 📂 Project Setup (Example)

```bash
# Clone the repository
git clone https://github.com/your-username/donorconnect.git
cd donorconnect

# Backend: Python (FastAPI)
pip install -r requirements.txt
python app.py

#Streamlit Run
python -m streamlit run medicine.py
streamlit run medicine.py




