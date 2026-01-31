import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Mic, MicOff, Send, MessageCircle, X, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Donor } from "./donor-management";
import { Camp } from "./camp-management";
import { BloodInventory } from "./blood-inventory";
import { EmergencyRequest } from "./emergency-requests";
import { Appointment } from "./doctor-appointments";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface VoiceChatbotProps {
  onAddDonor: (donor: Omit<Donor, 'donor_id'>) => void;
  onAddCamp: (camp: Omit<Camp, 'camp_id' | 'registered'>) => void;
  onAddInventory: (item: Omit<BloodInventory, 'inventory_id'>) => void;
  onAddRequest: (request: Omit<EmergencyRequest, 'request_id' | 'created_at' | 'status'>) => void;
  onAddAppointment: (appointment: Omit<Appointment, 'appointment_id' | 'status'>) => void;
  donors: Donor[];
  camps: Camp[];
  inventory: BloodInventory[];
  onNavigate: (tab: string) => void;
}

export function VoiceChatbot({
  onAddDonor,
  onAddCamp,
  onAddInventory,
  onAddRequest,
  onAddAppointment,
  donors,
  camps,
  inventory,
  onNavigate,
}: VoiceChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "👋 Hi! I'm your DonorConnect AI Assistant. I can help you with voice or text commands. Try saying 'register a donor' or 'search for donors'!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Voice recognition error. Please try again.");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessage = (text: string, type: "user" | "bot") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    
    if (type === "bot") {
      speak(text);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        recognition.start();
        setIsListening(true);
        toast.info("Listening... Speak now!");
      } else {
        toast.error("Voice recognition not supported in this browser.");
      }
    }
  };

  const handleUserInput = (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    addMessage(trimmedInput, "user");
    processCommand(trimmedInput.toLowerCase());
    setInputText("");
  };

  const processCommand = (command: string) => {
    // Register Donor
    if (command.includes("register") && (command.includes("donor") || command.includes("donor"))) {
      addMessage("I'll help you register a new donor. Please use the Donors tab to fill in the donor details form.", "bot");
      setTimeout(() => onNavigate("donors"), 1000);
      return;
    }

    // Schedule Camp
    if (command.includes("schedule") && command.includes("camp")) {
      addMessage("I'll help you schedule a blood donation camp. Navigating to the Camps section...", "bot");
      setTimeout(() => onNavigate("camps"), 1000);
      return;
    }

    // Search/Find Donors
    if ((command.includes("search") || command.includes("find")) && command.includes("donor")) {
      // Extract blood group if mentioned
      const bloodGroups = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"];
      let foundGroup = "";
      bloodGroups.forEach(bg => {
        if (command.includes(bg) || command.includes(bg.replace("+", " positive")) || command.includes(bg.replace("-", " negative"))) {
          foundGroup = bg.toUpperCase();
        }
      });

      if (foundGroup) {
        const matchingDonors = donors.filter(d => d.blood_group === foundGroup);
        addMessage(`Found ${matchingDonors.length} donors with blood group ${foundGroup}. Navigating to Donors tab...`, "bot");
      } else {
        addMessage(`Found ${donors.length} total donors in the system. Navigating to Donors tab...`, "bot");
      }
      setTimeout(() => onNavigate("donors"), 1000);
      return;
    }

    // Check Inventory
    if ((command.includes("check") || command.includes("show")) && (command.includes("inventory") || command.includes("blood") && command.includes("stock"))) {
      const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
      addMessage(`Current blood inventory: ${totalUnits} total units available. Navigating to Inventory tab...`, "bot");
      setTimeout(() => onNavigate("inventory"), 1000);
      return;
    }

    // Emergency Request
    if (command.includes("emergency") || (command.includes("urgent") && command.includes("request"))) {
      addMessage("Creating an emergency blood request. Navigating to Emergency section...", "bot");
      setTimeout(() => onNavigate("emergency"), 1000);
      return;
    }

    // Book Appointment
    if (command.includes("appointment") || command.includes("doctor")) {
      addMessage("I'll help you schedule a doctor appointment. Navigating to Appointments section...", "bot");
      setTimeout(() => onNavigate("appointments"), 1000);
      return;
    }

    // Show Dashboard
    if (command.includes("dashboard") || command.includes("overview") || command.includes("statistics")) {
      addMessage("Showing the analytics dashboard with all statistics...", "bot");
      setTimeout(() => onNavigate("dashboard"), 1000);
      return;
    }

    // Show Camps
    if (command.includes("show") && command.includes("camp")) {
      addMessage(`There are ${camps.length} camps scheduled. Navigating to Camps section...`, "bot");
      setTimeout(() => onNavigate("camps"), 1000);
      return;
    }

    // Add Blood to Inventory
    if (command.includes("add blood") || (command.includes("add") && command.includes("inventory"))) {
      addMessage("I'll help you add blood units to inventory. Navigating to Inventory section...", "bot");
      setTimeout(() => onNavigate("inventory"), 1000);
      return;
    }

    // List all commands (help)
    if (command.includes("help") || command.includes("what can you do") || command.includes("commands")) {
      const helpMessage = `Here are some commands you can try:\n
📋 "Show dashboard" - View analytics\n
👥 "Register a donor" - Add new donor\n
🔍 "Search for donors" or "Find O+ donors"\n
🏥 "Schedule a camp" - Create blood camp\n
🩸 "Check inventory" - View blood stock\n
🚨 "Create emergency request"\n
💉 "Book appointment" - Schedule doctor visit\n
📊 "Show camps" - View all camps`;
      addMessage(helpMessage, "bot");
      return;
    }

    // Quick add commands with sample data
    if (command.includes("quick add donor")) {
      const sampleDonor = {
        name: "Test Donor",
        blood_group: "O+",
        phone: "+91-9999999999",
        email: "test@email.com",
        city: "Mumbai",
        last_donation_date: new Date().toISOString().split('T')[0],
        gender: "Male",
        age: 30,
      };
      onAddDonor(sampleDonor);
      addMessage("✅ Quick test donor added successfully!", "bot");
      setTimeout(() => onNavigate("donors"), 1000);
      return;
    }

    // Default response
    addMessage("I'm not sure how to help with that. Try saying 'help' to see available commands, or use specific commands like 'register donor', 'check inventory', or 'show dashboard'.", "bot");
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="bg-red-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Voice AI Assistant
                {isSpeaking && <Volume2 className="h-4 w-4 animate-pulse" />}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === "user"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Voice Status */}
            {isListening && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-red-600 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-4 bg-red-600 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-4 bg-red-600 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-blue-700">Listening...</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={toggleListening}
                  className={`${
                    isListening 
                      ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  size="icon"
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUserInput(inputText);
                    }
                  }}
                  placeholder="Type or use voice..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleUserInput(inputText)}
                  className="bg-red-600 hover:bg-red-700"
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleUserInput("help")}>
                  Show Commands
                </Badge>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleUserInput("show dashboard")}>
                  Dashboard
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
