import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";

export interface Camp {
  camp_id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  start_time: string;
  end_time: string;
  organizer: string;
  capacity: number;
  registered: number;
}

interface CampManagementProps {
  camps: Camp[];
  onAddCamp: (camp: Omit<Camp, 'camp_id' | 'registered'>) => void;
}

export function CampManagement({ camps, onAddCamp }: CampManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    city: "",
    date: "",
    start_time: "",
    end_time: "",
    organizer: "",
    capacity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCamp({
      ...formData,
      capacity: parseInt(formData.capacity),
    });
    setFormData({
      title: "",
      venue: "",
      city: "",
      date: "",
      start_time: "",
      end_time: "",
      organizer: "",
      capacity: "",
    });
    setIsDialogOpen(false);
  };

  const getCampStatus = (date: string) => {
    const campDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    campDate.setHours(0, 0, 0, 0);
    
    if (campDate > today) return "upcoming";
    if (campDate.getTime() === today.getTime()) return "today";
    return "completed";
  };

  const upcomingCamps = camps.filter(camp => getCampStatus(camp.date) === "upcoming");
  const todayCamps = camps.filter(camp => getCampStatus(camp.date) === "today");
  const completedCamps = camps.filter(camp => getCampStatus(camp.date) === "completed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Camp Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Camp
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Blood Donation Camp</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Camp Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Community Blood Drive 2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., City Hall Auditorium"
                    required
                  />
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="e.g., Red Cross Society"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Expected Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 100"
                    required
                    min="1"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Schedule Camp
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Camps */}
      {todayCamps.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge className="bg-green-600">Today</Badge>
            Active Camps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayCamps.map((camp) => (
              <Card key={camp.camp_id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg">{camp.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.venue}, {camp.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.start_time} - {camp.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.registered} / {camp.capacity} registered</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline">{camp.organizer}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Camps */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Upcoming Camps ({upcomingCamps.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingCamps.map((camp) => (
            <Card key={camp.camp_id}>
              <CardHeader>
                <CardTitle className="text-lg">{camp.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{camp.venue}, {camp.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{camp.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{camp.start_time} - {camp.end_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{camp.registered} / {camp.capacity} registered</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline">{camp.organizer}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Camps */}
      {completedCamps.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Completed Camps ({completedCamps.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedCamps.slice(0, 6).map((camp) => (
              <Card key={camp.camp_id} className="opacity-75">
                <CardHeader>
                  <CardTitle className="text-lg">{camp.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.venue}, {camp.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{camp.registered} / {camp.capacity} attended</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
