import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { AlertCircle, Bell, CheckCircle, Clock, Phone, Mail } from "lucide-react";
import { Donor } from "./donor-management";

export interface EmergencyRequest {
  request_id: string;
  hospital_name: string;
  blood_group: string;
  units_needed: number;
  city: string;
  status: "pending" | "fulfilled" | "cancelled";
  created_at: string;
  contact_phone?: string;
  contact_email?: string;
}

interface EmergencyRequestsProps {
  requests: EmergencyRequest[];
  donors: Donor[];
  onAddRequest: (request: Omit<EmergencyRequest, 'request_id' | 'created_at' | 'status'>) => void;
  onUpdateStatus: (requestId: string, status: "fulfilled" | "cancelled") => void;
}

export function EmergencyRequests({ requests, donors, onAddRequest, onUpdateStatus }: EmergencyRequestsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
  const [formData, setFormData] = useState({
    hospital_name: "",
    blood_group: "",
    units_needed: "",
    city: "",
    contact_phone: "",
    contact_email: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({
      ...formData,
      units_needed: parseInt(formData.units_needed),
    });
    setFormData({
      hospital_name: "",
      blood_group: "",
      units_needed: "",
      city: "",
      contact_phone: "",
      contact_email: "",
    });
    setIsDialogOpen(false);
  };

  // Memoize donor matching logic - recomputes when donors array changes
  const findMatchingDonors = useMemo(() => {
    return (bloodGroup: string, city: string) => {
      return donors.filter(donor => {
        // Check blood group compatibility
        const isBloodGroupMatch = donor.blood_group === bloodGroup || 
          (bloodGroup === "AB+" ? true : false) || // AB+ can receive from all
          (bloodGroup === "AB-" && donor.blood_group.endsWith("-")) || // AB- can receive from all negative
          (donor.blood_group === "O-"); // O- is universal donor
        
        // Check city match
        const isCityMatch = donor.city.toLowerCase() === city.toLowerCase();
        
        // Check eligibility (90 days since last donation)
        const lastDonation = new Date(donor.last_donation_date);
        const today = new Date();
        const daysSince = Math.ceil((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
        const isEligible = daysSince >= 90;
        
        return isBloodGroupMatch && isCityMatch && isEligible;
      });
    };
  }, [donors]);

  const pendingRequests = requests.filter(r => r.status === "pending");
  const fulfilledRequests = requests.filter(r => r.status === "fulfilled");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Emergency Requests</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <AlertCircle className="mr-2 h-4 w-4" />
              New Emergency Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Emergency Blood Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital Name</Label>
                <Input
                  id="hospital_name"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group Needed</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units_needed">Units Needed</Label>
                  <Input
                    id="units_needed"
                    type="number"
                    value={formData.units_needed}
                    onChange={(e) => setFormData({ ...formData, units_needed: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Submit Emergency Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Urgent Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600 animate-pulse" />
            Active Emergency Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => {
              const matchingDonors = findMatchingDonors(request.blood_group, request.city);
              const timeAgo = Math.floor((new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 60));
              
              return (
                <Card key={request.request_id} className="border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{request.hospital_name}</span>
                      <Badge className="bg-red-600">{request.blood_group}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Units Needed:</span>
                        <span className="font-semibold">{request.units_needed} units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-semibold">{request.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo} minutes ago</span>
                      </div>
                      {request.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{request.contact_phone}</span>
                        </div>
                      )}
                      {request.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{request.contact_email}</span>
                        </div>
                      )}
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Matching Donors: {matchingDonors.length}</AlertTitle>
                      <AlertDescription>
                        {matchingDonors.length > 0 ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View matching donors
                          </Button>
                        ) : (
                          "No eligible donors found in this city"
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => onUpdateStatus(request.request_id, "fulfilled")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Fulfilled
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(request.request_id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Matching Donors Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Matching Donors for {selectedRequest.blood_group} in {selectedRequest.city}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {findMatchingDonors(selectedRequest.blood_group, selectedRequest.city).map((donor) => (
                <Card key={donor.donor_id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{donor.name}</div>
                        <div className="text-sm text-muted-foreground">{donor.age}Y, {donor.gender}</div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {donor.blood_group}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {donor.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {donor.email}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Fulfilled Requests */}
      {fulfilledRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Recently Fulfilled ({fulfilledRequests.slice(0, 5).length})</h3>
          <div className="space-y-2">
            {fulfilledRequests.slice(0, 5).map((request) => (
              <Card key={request.request_id} className="bg-green-50 border-green-200">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold">{request.hospital_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.units_needed} units of {request.blood_group} • {request.city}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Fulfilled</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Emergency Requests</AlertTitle>
          <AlertDescription>
            All emergency requests have been fulfilled or cancelled.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
