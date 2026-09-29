import type { User } from "@workspace/db";

export interface MemoryLawyerProfile {
  id: number;
  userId: number;
  lawyerId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  barCouncilNumber: string;
  barCouncilState: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  courtLocations: string[];
  languages: string[];
  bio: string;
  fee: number;
  rating: number;
  reviews: number;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "UNDER_REVIEW";
  accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  verificationMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryOtp {
  code: string;
  purpose: string;
  userId: number;
  expiresAt: Date;
  used: boolean;
}

export interface MemoryAppointment {
  id: number;
  apptRef: string;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientLocation: string;
  lawyerId: number;
  lawyerName: string;
  caseId?: string;
  caseTitle: string;
  type: "VIDEO" | "OFFICE" | "PHONE";
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED";
  fee: number;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const initialUsers: User[] = [
  {
    id: 1,
    fullName: "Nyaya Administrator",
    email: "admin@nyaya.in",
    passwordHash: "mock",
    role: "admin",
    createdAt: new Date("2026-09-01T00:00:00Z"),
  },
  {
    id: 101,
    fullName: "Rahul Sharma",
    email: "client@nyaya.in",
    passwordHash: "mock",
    role: "client",
    createdAt: new Date("2026-09-02T10:00:00Z"),
  },
  {
    id: 102,
    fullName: "Pooja Verma",
    email: "pooja.verma@example.com",
    passwordHash: "mock",
    role: "client",
    createdAt: new Date("2026-09-05T14:30:00Z"),
  },
  {
    id: 103,
    fullName: "Vikram Malhotra",
    email: "vikram.m@example.com",
    passwordHash: "mock",
    role: "client",
    createdAt: new Date("2026-09-10T11:15:00Z"),
  },
  {
    id: 201,
    fullName: "Adv. Rohan Iyer",
    email: "lawyer@nyaya.in",
    passwordHash: "mock",
    role: "lawyer",
    createdAt: new Date("2026-09-01T08:00:00Z"),
  },
  {
    id: 202,
    fullName: "Adv. Meera Sen",
    email: "meera.sen@example.com",
    passwordHash: "mock",
    role: "lawyer",
    createdAt: new Date("2026-09-02T09:00:00Z"),
  },
  {
    id: 203,
    fullName: "Adv. Rajesh Nair",
    email: "rajesh.nair@example.com",
    passwordHash: "mock",
    role: "lawyer",
    createdAt: new Date("2026-09-03T10:00:00Z"),
  },
  {
    id: 204,
    fullName: "Adv. Ananya Deshmukh",
    email: "ananya.d@example.com",
    passwordHash: "mock",
    role: "lawyer",
    createdAt: new Date("2026-09-04T12:00:00Z"),
  },
  {
    id: 205,
    fullName: "Adv. Kabir Saxena",
    email: "kabir.saxena@example.com",
    passwordHash: "mock",
    role: "lawyer",
    createdAt: new Date("2026-09-15T15:00:00Z"),
  },
];

const initialProfiles: MemoryLawyerProfile[] = [
  {
    id: 1,
    userId: 201,
    lawyerId: "LAW-000101",
    fullName: "Adv. Rohan Iyer",
    email: "lawyer@nyaya.in",
    phone: "+91 98200 44556",
    location: "Mumbai, Maharashtra",
    barCouncilNumber: "MAH/4821/2012",
    barCouncilState: "Bar Council of Maharashtra & Goa",
    yearsOfExperience: 12,
    practiceAreas: ["Property Law", "Civil Law", "Commercial Law"],
    courtLocations: ["Bombay High Court", "City Civil Court Mumbai"],
    languages: ["English", "Hindi", "Marathi"],
    bio: "Specialist in property dispute resolution, consumer protection, and commercial arbitration before Bombay High Court.",
    fee: 1800,
    rating: 4.9,
    reviews: 124,
    verificationStatus: "VERIFIED",
    accountStatus: "ACTIVE",
    verificationMessage: "Credentials verified by Bar Council records.",
    createdAt: new Date("2026-09-01T08:00:00Z"),
    updatedAt: new Date("2026-09-01T08:00:00Z"),
  },
  {
    id: 2,
    userId: 202,
    lawyerId: "LAW-000102",
    fullName: "Adv. Meera Sen",
    email: "meera.sen@example.com",
    phone: "+91 98111 22334",
    location: "New Delhi, Delhi",
    barCouncilNumber: "D/1942/2015",
    barCouncilState: "Bar Council of Delhi",
    yearsOfExperience: 9,
    practiceAreas: ["Criminal Law", "Constitutional Law", "Bail Matters"],
    courtLocations: ["Delhi High Court", "Patiala House Courts", "Tis Hazari Court"],
    languages: ["English", "Hindi", "Bengali"],
    bio: "Experienced advocate focusing on criminal trial defense, regular & anticipatory bail, and appellate practice.",
    fee: 2000,
    rating: 4.8,
    reviews: 89,
    verificationStatus: "VERIFIED",
    accountStatus: "ACTIVE",
    verificationMessage: "Verified by Bar Council of Delhi.",
    createdAt: new Date("2026-09-02T09:00:00Z"),
    updatedAt: new Date("2026-09-02T09:00:00Z"),
  },
  {
    id: 3,
    userId: 203,
    lawyerId: "LAW-000103",
    fullName: "Adv. Rajesh Nair",
    email: "rajesh.nair@example.com",
    phone: "+91 94470 55667",
    location: "Bengaluru, Karnataka",
    barCouncilNumber: "KAR/3021/2010",
    barCouncilState: "Bar Council of Karnataka",
    yearsOfExperience: 14,
    practiceAreas: ["Corporate Law", "Contract Drafting", "Intellectual Property"],
    courtLocations: ["Karnataka High Court", "Commercial Courts Bengaluru"],
    languages: ["English", "Kannada", "Malayalam", "Hindi"],
    bio: "Senior corporate counsel handling founder agreements, trademark registration, and tech sector contractual disputes.",
    fee: 2500,
    rating: 4.9,
    reviews: 142,
    verificationStatus: "VERIFIED",
    accountStatus: "ACTIVE",
    verificationMessage: "Verified credentials.",
    createdAt: new Date("2026-09-03T10:00:00Z"),
    updatedAt: new Date("2026-09-03T10:00:00Z"),
  },
  {
    id: 4,
    userId: 204,
    lawyerId: "LAW-000104",
    fullName: "Adv. Ananya Deshmukh",
    email: "ananya.d@example.com",
    phone: "+91 97654 33221",
    location: "Pune, Maharashtra",
    barCouncilNumber: "MAH/6721/2017",
    barCouncilState: "Bar Council of Maharashtra & Goa",
    yearsOfExperience: 7,
    practiceAreas: ["Family Law", "Matrimonial Disputes", "Divorce & Custody"],
    courtLocations: ["Family Court Pune", "District & Sessions Court Pune"],
    languages: ["English", "Hindi", "Marathi"],
    bio: "Dedicated advocate specializing in family mediation, divorce petitions, child custody, and domestic violence protections.",
    fee: 1500,
    rating: 4.7,
    reviews: 67,
    verificationStatus: "VERIFIED",
    accountStatus: "ACTIVE",
    verificationMessage: "Verified credentials.",
    createdAt: new Date("2026-09-04T12:00:00Z"),
    updatedAt: new Date("2026-09-04T12:00:00Z"),
  },
  {
    id: 5,
    userId: 205,
    lawyerId: "LAW-000105",
    fullName: "Adv. Kabir Saxena",
    email: "kabir.saxena@example.com",
    phone: "+91 98490 88990",
    location: "Hyderabad, Telangana",
    barCouncilNumber: "TS/4102/2019",
    barCouncilState: "Bar Council of Telangana",
    yearsOfExperience: 5,
    practiceAreas: ["Cyber Law", "Data Privacy", "IT Act Disputes"],
    courtLocations: ["Telangana High Court", "City Civil Court Hyderabad"],
    languages: ["English", "Hindi", "Telugu"],
    bio: "Specialist in cyber fraud recovery, digital defamation, data privacy compliance, and IT Act representations.",
    fee: 1600,
    rating: 4.6,
    reviews: 31,
    verificationStatus: "PENDING",
    accountStatus: "PENDING_VERIFICATION",
    verificationMessage: "Application submitted. Verification pending administrative approval.",
    createdAt: new Date("2026-09-15T15:00:00Z"),
    updatedAt: new Date("2026-09-15T15:00:00Z"),
  },
];

const initialAppointments: MemoryAppointment[] = [
  {
    id: 1,
    apptRef: "APPT-2026-001",
    clientId: 101,
    clientName: "Rahul Sharma",
    clientEmail: "client@nyaya.in",
    clientPhone: "+91 98765 43210",
    clientLocation: "Mumbai, Maharashtra",
    lawyerId: 201,
    lawyerName: "Adv. Rohan Iyer",
    caseId: "CASE-10024",
    caseTitle: "Property boundary dispute with neighbour",
    type: "VIDEO",
    date: "2026-09-21",
    time: "11:30 AM",
    status: "CONFIRMED",
    fee: 1800,
    meetingLink: "https://meet.google.com/nya-law-meet",
    createdAt: new Date("2026-09-08T10:00:00Z"),
    updatedAt: new Date("2026-09-08T10:00:00Z"),
  },
];

class MemoryStore {
  private users: User[] = [...initialUsers];
  private profiles: MemoryLawyerProfile[] = [...initialProfiles];
  private appointments: MemoryAppointment[] = [...initialAppointments];
  private otps: Map<string, MemoryOtp> = new Map();

  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string, role?: string): User | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.users.find((u) => u.email === cleanEmail && (!role || u.role === role));
  }

  addUser(user: User): User {
    const existingIndex = this.users.findIndex((u) => u.email === user.email && u.role === user.role);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.unshift(user);
    }
    return user;
  }

  updateUserStatus(userId: number, _status: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    return !!user;
  }

  getLawyerProfiles(): MemoryLawyerProfile[] {
    return [...this.profiles];
  }

  getLawyerProfileByUserId(userId: number): MemoryLawyerProfile | undefined {
    return this.profiles.find((p) => p.userId === userId);
  }

  getLawyerProfileById(lawyerId: string): MemoryLawyerProfile | undefined {
    return this.profiles.find(
      (p) => p.lawyerId === lawyerId || String(p.userId) === lawyerId || `LAW${p.userId}` === lawyerId,
    );
  }

  addLawyerProfile(profile: MemoryLawyerProfile): MemoryLawyerProfile {
    const existingIndex = this.profiles.findIndex((p) => p.userId === profile.userId || p.lawyerId === profile.lawyerId);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = { ...this.profiles[existingIndex], ...profile };
      return this.profiles[existingIndex];
    }
    this.profiles.unshift(profile);
    return profile;
  }

  updateLawyerVerification(
    identifier: string,
    status: "VERIFIED" | "REJECTED" | "UNDER_REVIEW",
    message?: string,
  ): MemoryLawyerProfile | null {
    const profile = this.getLawyerProfileById(identifier);
    if (!profile) return null;

    profile.verificationStatus = status;
    profile.accountStatus = status === "VERIFIED" ? "ACTIVE" : status === "REJECTED" ? "SUSPENDED" : "PENDING_VERIFICATION";
    if (message) profile.verificationMessage = message;
    profile.updatedAt = new Date();
    return profile;
  }

  storeOtp(email: string, code: string, purpose: string, userId: number): void {
    const key = `${email.trim().toLowerCase()}:${purpose}`;
    this.otps.set(key, {
      code,
      purpose,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false,
    });
  }

  verifyOtp(email: string, code: string, purpose: string): { valid: boolean; userId?: number } {
    const key = `${email.trim().toLowerCase()}:${purpose}`;
    const entry = this.otps.get(key);

    if (!entry) return { valid: false };
    if (entry.used) return { valid: false };
    if (new Date() > entry.expiresAt) return { valid: false };
    if (entry.code !== code) return { valid: false };

    entry.used = true;
    return { valid: true, userId: entry.userId };
  }

  getAppointments(): MemoryAppointment[] {
    return [...this.appointments];
  }

  getAppointmentsByLawyer(lawyerId: number): MemoryAppointment[] {
    return this.appointments.filter((a) => a.lawyerId === lawyerId);
  }

  getAppointmentsByClient(clientId: number): MemoryAppointment[] {
    return this.appointments.filter((a) => a.clientId === clientId);
  }

  addAppointment(appt: MemoryAppointment): MemoryAppointment {
    const existingIndex = this.appointments.findIndex((a) => a.apptRef === appt.apptRef);
    if (existingIndex >= 0) {
      this.appointments[existingIndex] = { ...this.appointments[existingIndex], ...appt };
      return this.appointments[existingIndex];
    }
    this.appointments.unshift(appt);
    return appt;
  }

  updateAppointmentStatus(
    apptRef: string,
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED",
    date?: string,
    time?: string,
  ): MemoryAppointment | null {
    const appt = this.appointments.find((a) => a.apptRef === apptRef);
    if (!appt) return null;
    appt.status = status;
    if (date) appt.date = date;
    if (time) appt.time = time;
    appt.updatedAt = new Date();
    return appt;
  }
}

export const memoryStore = new MemoryStore();
