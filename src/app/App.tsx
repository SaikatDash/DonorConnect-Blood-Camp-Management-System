import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Dashboard } from "@/app/components/dashboard";
import { DonorManagement, Donor } from "@/app/components/donor-management";
import { CampManagement, Camp } from "@/app/components/camp-management";
import { BloodInventoryComponent, BloodInventory } from "@/app/components/blood-inventory";
import { DoctorMaster, Doctor } from "@/app/components/doctor-master";
import { EmergencyRequests, EmergencyRequest } from "@/app/components/emergency-requests";
import { DoctorAppointments, Appointment } from "@/app/components/doctor-appointments";
import { VoiceChatbot } from "@/app/components/voice-chatbot";
import { NearestBloodBank } from "@/app/components/nearest-blood-bank";
import { Login } from "@/app/components/login";
import { Toaster } from "@/app/components/ui/sonner";
import { toast } from "sonner";
import { Droplets, LayoutDashboard, Users, Calendar, Package, AlertCircle, Stethoscope, LogOut, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import * as api from "@/services/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");
    
    if (token && username) {
      setIsAuthenticated(true);
      const userRole = role || "user";
      setCurrentUser({ username, role: userRole });
      // Ensure default tab matches role on refresh
      if (userRole === "user") setActiveTab("nearest");
      else if (userRole === "staff") setActiveTab("donors");
      else setActiveTab("dashboard");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user: { username: string; role: string }) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    // Set default tab based on role
    if (user.role === "user") setActiveTab("nearest");
    else if (user.role === "staff") setActiveTab("donors");
    else setActiveTab("dashboard");
    toast.success(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.info("Logged out successfully");
  };

  // Show login page if not authenticated
  /*if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }*/

  // Fetch all data from API on component mount (only after authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [donorsData, campsData, inventoryData, requestsData, appointmentsData, doctorsData] = await Promise.all([
          api.fetchDonors(),
          api.fetchCamps(),
          api.fetchInventory(),
          api.fetchEmergencyRequests(),
          api.fetchAppointments(),
          api.fetchDoctors(),
        ]);
        
        setDonors(donorsData);
        setCamps(campsData);
        setInventory(inventoryData);
        setRequests(requestsData);
        setAppointments(appointmentsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data from server");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated]);

  // Handlers for adding new items
  const handleAddDonor = async (donor: Omit<Donor, 'donor_id'>) => {
    try {
      const result = await api.addDonor(donor);
      const newDonor = { ...donor, donor_id: result.donor_id };
      setDonors([...donors, newDonor]);
      toast.success("Donor added successfully");
    } catch (error) {
      console.error("Error adding donor:", error);
      toast.error("Failed to add donor");
    }
  };

  const handleAddCamp = async (camp: Omit<Camp, 'camp_id' | 'registered'>) => {
    try {
      const result = await api.addCamp({ ...camp, registered: 0 });
      const newCamp = { ...camp, camp_id: result.camp_id, registered: 0 };
      setCamps([...camps, newCamp]);
      toast.success("Camp added successfully");
    } catch (error) {
      console.error("Error adding camp:", error);
      toast.error("Failed to add camp");
    }
  };

  const handleAddInventory = async (item: Omit<BloodInventory, 'inventory_id'>) => {
    try {
      const result = await api.addInventory(item);
      const newItem = { ...item, inventory_id: result.inventory_id };
      setInventory([...inventory, newItem]);
      toast.success("Inventory item added successfully");
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast.error("Failed to add inventory item");
    }
  };

  const handleAddRequest = async (request: Omit<EmergencyRequest, 'request_id' | 'created_at' | 'status'>) => {
    try {
      const result = await api.addEmergencyRequest(request);
      const newRequest = {
        ...request,
        request_id: result.request_id,
        created_at: new Date().toISOString(),
        status: "pending" as const,
      };
      setRequests([...requests, newRequest]);
      toast.success("Emergency request created");
    } catch (error) {
      console.error("Error adding request:", error);
      toast.error("Failed to create emergency request");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: "fulfilled" | "cancelled") => {
    try {
      await api.updateEmergencyRequestStatus(requestId, status);
      setRequests(requests.map(req => 
        req.request_id === requestId ? { ...req, status } : req
      ));
      toast.success(`Request ${status}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  const handleAddAppointment = async (appointment: Omit<Appointment, 'appointment_id' | 'status'>) => {
    try {
      const result = await api.addAppointment(appointment);
      const newAppointment = {
        ...appointment,
        appointment_id: result.appointment_id,
        status: "scheduled" as const,
      };
      setAppointments([...appointments, newAppointment]);
      toast.success("Appointment scheduled");
    } catch (error) {
      console.error("Error adding appointment:", error);
      toast.error("Failed to schedule appointment");
    }
  };

  const handleAddDoctor = async (doctor: Omit<Doctor, 'doctor_id'>) => {
    try {
      const result = await api.addDoctor(doctor);
      const newDoctor = { ...doctor, doctor_id: result.doctor_id } as Doctor;
      setDoctors([...doctors, newDoctor]);
      toast.success("Doctor added successfully");
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor");
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: "completed" | "cancelled") => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      setAppointments(appointments.map(apt => 
        apt.appointment_id === appointmentId ? { ...apt, status } : apt
      ));
      toast.success(`Appointment ${status}`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  // Calculate dashboard data
  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
  const urgentRequests = requests.filter(r => r.status === "pending").length;

  const bloodGroupData = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => ({
    name: bg,
    units: inventory.filter(i => i.blood_group === bg).reduce((sum, i) => sum + i.units_available, 0),
  }));

  const monthlyData = [
    { month: "Aug", units: 145 },
    { month: "Sep", units: 178 },
    { month: "Oct", units: 162 },
    { month: "Nov", units: 195 },
    { month: "Dec", units: 210 },
    { month: "Jan", units: 187 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">DonorConnect</h1>
                <p className="text-red-100 text-sm">Blood Donation Camp & Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-700 px-4 py-2 rounded-lg">
                <User className="h-5 w-5" />
                <div className="text-sm">
                  <p className="font-semibold">{currentUser?.username}</p>
                  <p className="text-red-200 text-xs capitalize">{currentUser?.role}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data from server...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tabs list varies by role */}
            {currentUser?.role === "user" ? (
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="nearest" className="flex items-center gap-2 py-3">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Nearest Banks</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2 py-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Emergency</span>
                </TabsTrigger>
              </TabsList>
            ) : currentUser?.role === "staff" ? (
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="donors" className="flex items-center gap-2 py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Donor Register</span>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2 py-3">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventory Register</span>
                </TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="donors" className="flex items-center gap-2 py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Donors</span>
                </TabsTrigger>
                <TabsTrigger value="camps" className="flex items-center gap-2 py-3">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Camps</span>
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2 py-3">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger value="doctors" className="flex items-center gap-2 py-3">
                  <Stethoscope className="h-4 w-4" />
                  <span className="hidden sm:inline">Doctors</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2 py-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Emergency</span>
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-2 py-3">
                  <Stethoscope className="h-4 w-4" />
                  <span className="hidden sm:inline">Appointments</span>
                </TabsTrigger>
              </TabsList>
            )}

            {/* Tab content per role */}
            {currentUser?.role === "user" ? (
              <>
                <TabsContent value="nearest">
                  <NearestBloodBank inventory={inventory} onAddRequest={handleAddRequest} />
                </TabsContent>
                <TabsContent value="emergency">
                  <EmergencyRequests
                    requests={requests}
                    donors={[]}
                    onAddRequest={handleAddRequest}
                    onUpdateStatus={handleUpdateRequestStatus}
                  />
                </TabsContent>
              </>
            ) : currentUser?.role === "staff" ? (
              <>
                <TabsContent value="donors">
                  <DonorManagement donors={donors} onAddDonor={handleAddDonor} />
                </TabsContent>
                <TabsContent value="inventory">
                  <BloodInventoryComponent inventory={inventory} onAddInventory={handleAddInventory} />
                </TabsContent>
                <TabsContent value="doctors">
                  <DoctorMaster doctors={doctors} onAddDoctor={handleAddDoctor} />
                </TabsContent>
              </>
            ) : (
              <>
                <TabsContent value="dashboard">
                  <Dashboard
                    totalDonors={donors.length}
                    totalCamps={camps.length}
                    totalUnits={totalUnits}
                    urgentRequests={urgentRequests}
                    bloodGroupData={bloodGroupData}
                    monthlyData={monthlyData}
                  />
                </TabsContent>
                <TabsContent value="donors">
                  <DonorManagement donors={donors} onAddDonor={handleAddDonor} />
                </TabsContent>
                <TabsContent value="camps">
                  <CampManagement camps={camps} onAddCamp={handleAddCamp} />
                </TabsContent>
                <TabsContent value="inventory">
                  <BloodInventoryComponent inventory={inventory} onAddInventory={handleAddInventory} />
                </TabsContent>
                <TabsContent value="emergency">
                  <EmergencyRequests
                    requests={requests}
                    donors={donors}
                    onAddRequest={handleAddRequest}
                    onUpdateStatus={handleUpdateRequestStatus}
                  />
                </TabsContent>
                <TabsContent value="appointments">
                  <DoctorAppointments
                    appointments={appointments}
                    onAddAppointment={handleAddAppointment}
                    onUpdateStatus={handleUpdateAppointmentStatus}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        )}
      </main>

      {/* Voice Chatbot */}
      <VoiceChatbot
        onAddDonor={handleAddDonor}
        onAddCamp={handleAddCamp}
        onAddInventory={handleAddInventory}
        onAddRequest={handleAddRequest}
        onAddAppointment={handleAddAppointment}
        donors={donors}
        camps={camps}
        inventory={inventory}
        onNavigate={setActiveTab}
      />

      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            DonorConnect © 2026 | Saving Lives Together
          </p>
        </div>
      </footer>
    </div>
  );
}
