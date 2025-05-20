import { 
  users, type User, type InsertUser, 
  clients, type Client, type InsertClient,
  candidates, type Candidate, type InsertCandidate,
  applications, type Application, type InsertApplication
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Client methods
  getAllClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Candidate methods
  getAllCandidates(): Promise<Candidate[]>;
  getCandidateById(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Application methods
  getAllApplications(): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  approveApplication(id: number): Promise<Candidate | undefined>;
  deleteApplication(id: number): Promise<boolean>;
}

// Memory Storage implementation for development
export class DatabaseStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private candidates: Map<number, Candidate>;
  private applications: Map<number, Application>;
  
  private nextUserId: number = 1;
  private nextClientId: number = 1;
  private nextCandidateId: number = 1;
  private nextApplicationId: number = 1;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.candidates = new Map();
    this.applications = new Map();
    
    // Add a default admin user
    this.createUser({
      username: 'admin',
      password: 'password123',
      email: 'admin@tecnarit.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    // Add some sample data for testing
    this.createClient({
      name: 'Tech Innovations Inc.',
      contactPerson: 'Jennifer Lee',
      email: 'jennifer@techinnovations.com',
      phone: '(555) 123-4567',
      address: '123 Tech Blvd, San Francisco, CA',
      industry: 'Technology',
      status: 'active',
      notes: 'Looking for software developers and UX designers.'
    });
    
    this.createClient({
      name: 'Global Finance Group',
      contactPerson: 'Robert Chen',
      email: 'rchen@globalfinance.com',
      phone: '(555) 234-5678',
      address: '456 Finance Ave, New York, NY',
      industry: 'Finance',
      status: 'active',
      notes: 'Interested in data analysts and IT security specialists.'
    });
    
    // Add a sample candidate
    this.createCandidate({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      currentPosition: 'Senior Frontend Developer',
      experience: '6 years of experience in frontend development',
      education: 'B.S. Computer Science, Stanford University',
      skills: ['JavaScript', 'React', 'TypeScript', 'HTML/CSS'],
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      status: 'active',
      notes: 'Excellent communication skills',
      resumePath: '/resumes/sarah-johnson.pdf'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const timestamp = new Date();
    const newUser: User = { ...user, id, createdAt: timestamp, updatedAt: timestamp };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) {
      return false;
    }
    
    return this.users.delete(id);
  }

  // Client methods
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClientById(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.nextClientId++;
    const timestamp = new Date();
    const newClient: Client = { ...client, id, createdAt: timestamp };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient = { ...existingClient, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    if (!this.clients.has(id)) {
      return false;
    }
    
    return this.clients.delete(id);
  }

  // Candidate methods
  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidateById(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.nextCandidateId++;
    const timestamp = new Date();
    const newCandidate: Candidate = { ...candidate, id, createdAt: timestamp };
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    if (!existingCandidate) return undefined;

    const updatedCandidate = { ...existingCandidate, ...candidateData };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }
  
  async deleteCandidate(id: number): Promise<boolean> {
    if (!this.candidates.has(id)) {
      return false;
    }
    
    return this.candidates.delete(id);
  }

  // Application methods
  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.nextApplicationId++;
    const timestamp = new Date();
    const newApplication: Application = { 
      ...application,
      id,
      status: 'pending',
      createdAt: timestamp
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) return undefined;

    const updatedApplication = { ...existingApplication, status };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async approveApplication(id: number): Promise<Candidate | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;

    // Update application status to approved
    await this.updateApplicationStatus(id, 'approved');

    // Create a new candidate from the application data
    const candidate: InsertCandidate = {
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone || '',
      location: '',
      currentPosition: application.position,
      experience: application.experience,
      education: application.education || '',
      skills: application.skills,
      status: 'active',
      notes: application.coverLetter || '',
      resumePath: application.resumePath || '',
      linkedinUrl: ''
    };

    return this.createCandidate(candidate);
  }
  
  async deleteApplication(id: number): Promise<boolean> {
    const application = this.applications.get(id);
    if (!application) {
      return false;
    }
    
    this.applications.delete(id);
    return true;
  }
}

export const storage = new DatabaseStorage();
