// API Service for connecting to FastAPI backend

const API_BASE_URL = "http://localhost:8000/api";

// Fetch all donors
export async function fetchDonors() {
  const response = await fetch(`${API_BASE_URL}/donors`);
  if (!response.ok) throw new Error("Failed to fetch donors");
  return response.json();
}

// Add a new donor
export async function addDonor(donor: any) {
  const response = await fetch(`${API_BASE_URL}/donors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donor),
  });
  if (!response.ok) throw new Error("Failed to add donor");
  return response.json();
}

// Fetch all camps
export async function fetchCamps() {
  const response = await fetch(`${API_BASE_URL}/camps`);
  if (!response.ok) throw new Error("Failed to fetch camps");
  return response.json();
}

// Add a new camp
export async function addCamp(camp: any) {
  const response = await fetch(`${API_BASE_URL}/camps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(camp),
  });
  if (!response.ok) throw new Error("Failed to add camp");
  return response.json();
}

// Fetch all blood inventory
export async function fetchInventory() {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  if (!response.ok) throw new Error("Failed to fetch inventory");
  return response.json();
}

// Add a new inventory item
export async function addInventory(item: any) {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error("Failed to add inventory");
  return response.json();
}

// Fetch all emergency requests
export async function fetchEmergencyRequests() {
  const response = await fetch(`${API_BASE_URL}/emergency-requests`);
  if (!response.ok) throw new Error("Failed to fetch emergency requests");
  return response.json();
}

// Add a new emergency request
export async function addEmergencyRequest(request: any) {
  const response = await fetch(`${API_BASE_URL}/emergency-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to add emergency request");
  return response.json();
}

// Update emergency request status
export async function updateEmergencyRequestStatus(requestId: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/emergency-requests/${requestId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update request status");
  return response.json();
}

// Fetch all appointments
export async function fetchAppointments() {
  const response = await fetch(`${API_BASE_URL}/appointments`);
  if (!response.ok) throw new Error("Failed to fetch appointments");
  return response.json();
}

// Add a new appointment
export async function addAppointment(appointment: any) {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  if (!response.ok) throw new Error("Failed to add appointment");
  return response.json();
}

// Update appointment status
export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update appointment status");
  return response.json();
}

// Submit donation data
export async function submitDonation(data: any) {
  const response = await fetch(`${API_BASE_URL}/donations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to submit donation");
  return response.json();
}

// Doctors master
export async function fetchDoctors() {
  const response = await fetch(`${API_BASE_URL}/doctors`);
  if (!response.ok) throw new Error("Failed to fetch doctors");
  return response.json();
}

export async function addDoctor(doctor: any) {
  const response = await fetch(`${API_BASE_URL}/doctors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctor),
  });
  if (!response.ok) throw new Error("Failed to add doctor");
  return response.json();
}
