// Mock data for the Smart Inbox Platform MVP

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: "me" | "tenant";
  channel: "email" | "whatsapp" | "phone";
}

export interface Conversation {
  id: string;
  tenantName: string;
  tenantEmail: string;
  propertyId: string;
  propertyName: string;
  channel: "email" | "whatsapp" | "phone";
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
  messages: Message[];
  aiSummary: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  rules: {
    petPolicy: string;
    trashSchedule: string;
    wifiNetwork: string;
    wifiPassword: string;
    parkingRules: string;
  };
  tenants: Tenant[];
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  leaseStart: Date;
  leaseEnd: Date;
  rentAmount: number;
  pets: string;
  notes: TenantNote[];
}

export interface TenantNote {
  id: string;
  content: string;
  timestamp: Date;
  type: "auto" | "manual";
  source?: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
}

// Mock conversations data
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    tenantName: "Sarah Johnson",
    tenantEmail: "sarah.johnson@email.com",
    propertyId: "prop-1",
    propertyName: "Oakwood Apartments - Unit 5B",
    channel: "email",
    lastMessage: "Thank you for scheduling the maintenance visit. I'll be home tomorrow between 10-2 PM.",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unread: false,
    aiSummary: "Tenant reported leaking faucet in kitchen; maintenance visit scheduled for tomorrow 10-2 PM",
    messages: [
      {
        id: "msg-1",
        content: "Hi, I have a leaking faucet in my kitchen. Water is dripping constantly and I'm concerned about water damage. Could someone take a look?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        sender: "tenant",
        channel: "email"
      },
      {
        id: "msg-2", 
        content: "Hi Sarah, thanks for reporting this. I'll have our maintenance team come by tomorrow between 10 AM and 2 PM to fix the leak. Please let me know if this time works for you.",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        sender: "me",
        channel: "email"
      },
      {
        id: "msg-3",
        content: "Thank you for scheduling the maintenance visit. I'll be home tomorrow between 10-2 PM.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        sender: "tenant",
        channel: "email"
      }
    ]
  },
  {
    id: "conv-2",
    tenantName: "Mike Chen",
    tenantEmail: "mike.chen@email.com",
    propertyId: "prop-2",
    propertyName: "Pine Grove Complex - Unit 12A",
    channel: "whatsapp",
    lastMessage: "What's the WiFi password again? I have guests coming over.",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: true,
    aiSummary: "Tenant requesting WiFi password for guests",
    messages: [
      {
        id: "msg-4",
        content: "Hey! What's the WiFi password again? I have guests coming over.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sender: "tenant",
        channel: "whatsapp"
      }
    ]
  },
  {
    id: "conv-3",
    tenantName: "Emily Rodriguez",
    tenantEmail: "emily.rodriguez@email.com",
    propertyId: "prop-1",
    propertyName: "Oakwood Apartments - Unit 3C",
    channel: "email",
    lastMessage: "Perfect, thanks for clarifying the lease renewal terms.",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    unread: false,
    aiSummary: "Discussing lease renewal terms; tenant confirmed understanding of new rate",
    messages: [
      {
        id: "msg-5",
        content: "Hi, I wanted to discuss my lease renewal. What will the new rent amount be?",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        sender: "tenant",
        channel: "email"
      },
      {
        id: "msg-6",
        content: "Hi Emily! Your lease renewal rate will be $1,450/month, a 3% increase from your current rate. The lease would start March 1st. Let me know if you'd like to proceed.",
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
        sender: "me",
        channel: "email"
      },
      {
        id: "msg-7",
        content: "Perfect, thanks for clarifying the lease renewal terms.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        sender: "tenant",
        channel: "email"
      }
    ]
  }
];

// Mock properties data
export const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Oakwood Apartments",
    address: "123 Oakwood Drive, Portland, OR 97205",
    description: "Modern 3-story apartment complex with 24 units",
    rules: {
      petPolicy: "Cats and small dogs under 25lbs allowed with $300 deposit",
      trashSchedule: "Pickup every Tuesday and Friday morning",
      wifiNetwork: "OakwoodResident",
      wifiPassword: "Oak2024WiFi!",
      parkingRules: "One assigned space per unit. Guest parking available in visitor spots"
    },
    tenants: []
  },
  {
    id: "prop-2", 
    name: "Pine Grove Complex",
    address: "456 Pine Street, Portland, OR 97208",
    description: "Luxury apartment complex with amenities",
    rules: {
      petPolicy: "No pets allowed",
      trashSchedule: "Pickup every Monday and Thursday",
      wifiNetwork: "PineGrove_Guest",
      wifiPassword: "PineGrove123",
      parkingRules: "Underground garage with keycard access"
    },
    tenants: []
  }
];

// Mock tenants data
export const mockTenants: Tenant[] = [
  {
    id: "tenant-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(503) 555-0123",
    propertyId: "prop-1",
    propertyName: "Oakwood Apartments",
    unitNumber: "5B",
    leaseStart: new Date("2023-03-01"),
    leaseEnd: new Date("2024-02-29"),
    rentAmount: 1350,
    pets: "Cat - Whiskers",
    notes: [
      {
        id: "note-1",
        content: "Leaky faucet reported - maintenance scheduled",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: "auto",
        source: "conversation"
      },
      {
        id: "note-2",
        content: "Excellent tenant, always pays rent on time",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        type: "manual"
      }
    ]
  },
  {
    id: "tenant-2",
    name: "Mike Chen",
    email: "mike.chen@email.com", 
    phone: "(503) 555-0124",
    propertyId: "prop-2",
    propertyName: "Pine Grove Complex",
    unitNumber: "12A",
    leaseStart: new Date("2023-06-01"),
    leaseEnd: new Date("2024-05-31"),
    rentAmount: 1800,
    pets: "None",
    notes: [
      {
        id: "note-3",
        content: "Requested WiFi password for guests",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "auto",
        source: "conversation"
      }
    ]
  },
  {
    id: "tenant-3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(503) 555-0125", 
    propertyId: "prop-1",
    propertyName: "Oakwood Apartments",
    unitNumber: "3C",
    leaseStart: new Date("2023-03-01"),
    leaseEnd: new Date("2024-02-29"),
    rentAmount: 1405,
    pets: "None",
    notes: [
      {
        id: "note-4",
        content: "Discussed lease renewal - agreed to new terms",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        type: "auto",
        source: "conversation"
      }
    ]
  }
];

// Mock templates data
export const mockTemplates: Template[] = [
  {
    id: "template-1",
    name: "Rent Payment Reminder",
    content: "Hi {TenantName}, this is a friendly reminder that your rent payment of ${RentAmount} for {PropertyName} Unit {UnitNumber} is due on {DueDate}. Please let me know if you have any questions. Thank you!",
    category: "Payments"
  },
  {
    id: "template-2",
    name: "Maintenance Follow-up",
    content: "Hi {TenantName}, I wanted to follow up on the maintenance request for {PropertyName} Unit {UnitNumber}. The work has been completed. Please let me know if everything is working properly. Thank you!",
    category: "Maintenance"
  },
  {
    id: "template-3",
    name: "Lease Renewal Offer",
    content: "Dear {TenantName}, your lease for {PropertyName} Unit {UnitNumber} expires on {LeaseEndDate}. We'd like to offer you a renewal at ${NewRentAmount}/month for another year. Please let me know if you're interested by {ResponseDate}.",
    category: "Leasing"
  },
  {
    id: "template-4",
    name: "Property Information",
    content: "Hi {TenantName}! Here's the information you requested: WiFi Network: {WiFiNetwork}, Password: {WiFiPassword}. Trash pickup is {TrashSchedule}. Feel free to reach out if you need anything else!",
    category: "Information"
  }
];