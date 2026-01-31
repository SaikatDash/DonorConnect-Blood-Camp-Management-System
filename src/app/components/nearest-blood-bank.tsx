import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { MapPin, Droplets } from "lucide-react";

export interface NearestBloodBankProps {
  inventory: Array<{
    inventory_id: string;
    blood_group: string;
    units_available: number;
    location: string;
    camp_id?: string | null;
    expiry_date: string;
    city?: string; // optional if present in data later
  }>;
  onAddRequest: (request: {
    hospital_name: string;
    blood_group: string;
    units_needed: number;
    city: string;
    contact_phone?: string;
    contact_email?: string;
  }) => void;
}

export function NearestBloodBank({ inventory, onAddRequest }: NearestBloodBankProps) {
  const [city, setCity] = useState("");
  const [form, setForm] = useState({
    hospital_name: "",
    blood_group: "",
    units_needed: "",
    contact_phone: "",
    contact_email: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const filteredInventory = useMemo(() => {
    const c = city.trim().toLowerCase();
    // We only have `location` field; treat it as city/center name
    return inventory.filter((item) =>
      c === "" ? true : item.location.toLowerCase().includes(c)
    );
  }, [city, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    if (!form.hospital_name || !form.blood_group || !form.units_needed) return;
    onAddRequest({
      hospital_name: form.hospital_name,
      blood_group: form.blood_group,
      units_needed: parseInt(form.units_needed),
      city,
      contact_phone: form.contact_phone || undefined,
      contact_email: form.contact_email || undefined,
    });
    setForm({ hospital_name: "", blood_group: "", units_needed: "", contact_phone: "", contact_email: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Droplets className="h-6 w-6 text-red-600" />
          Nearest Blood Banks
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find by City or Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City / Location</Label>
              <Input
                id="city"
                placeholder="e.g., Mumbai, Delhi, Blood Bank name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Preferred Blood Group</Label>
              <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {filteredInventory
              .filter((i) => !form.blood_group || i.blood_group === form.blood_group)
              .map((item) => (
                <Card key={item.inventory_id} className="border-red-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{item.location}</div>
                        <div className="text-sm text-muted-foreground">Units Available: {item.units_available}</div>
                      </div>
                      <div className="text-sm font-mono">{item.blood_group}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Expiry: {item.expiry_date}</div>
                  </CardContent>
                </Card>
              ))}
            {filteredInventory.length === 0 && (
              <Alert className="md:col-span-2">
                <AlertDescription>
                  No blood banks matched. Try a broader location.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit an Emergency Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name">Hospital Name</Label>
              <Input
                id="hospital_name"
                value={form.hospital_name}
                onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units_needed">Units Needed</Label>
                <Input
                  id="units_needed"
                  type="number"
                  min="1"
                  value={form.units_needed}
                  onChange={(e) => setForm({ ...form, units_needed: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">Submit Request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
