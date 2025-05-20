import { 
  users, type User, type InsertUser, 
  clients, type Client, type InsertClient,
  candidates, type Candidate, type InsertCandidate,
  applications, type Application, type InsertApplication
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import * as bcrypt from "bcrypt";

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
  
  // Candidate methods
  getAllCandidates(): Promise<Candidate[]>;
  getCandidateById(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  
  // Application methods
  getAllApplications(): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  approveApplication(id: number): Promise<Candidate | undefined>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default admin user if none exists
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    try {
      const existingAdmin = await this.getUserByUsername("admin");
      
      if (!existingAdmin) {
        // Add demo admin user if it doesn't exist
        const passwordHash = await bcrypt.hash("password123", 10);
        await this.createUser({
          username: "admin",
          passwordHash: passwordHash,
          email: "admin@tecnarit.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin"
        });
        console.log("Created default admin user");
        
        // Maak een tweede admin gebruiker voor de bestaande gebruiker
        const password2Hash = await bcrypt.hash("password123", 10);
        await this.createUser({
          username: "razrou",
          passwordHash: password2Hash,
          email: "razrou@outlook.be",
          firstName: "Raz",
          lastName: "Rou",
          role: "admin"
        });
        console.log("Created second admin user");
      }
    } catch (error) {
      console.error("Failed to initialize admin user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Gebruik directe SQL query in plaats van ORM - zonder public. prefix
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1', 
        [username]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map van snake_case naar camelCase
      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        passwordHash: user.password_hash,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        passwordChangeRequired: user.password_change_required,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Gebruik directe SQL query in plaats van ORM - zonder public. prefix
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map van snake_case naar camelCase
      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        passwordHash: user.password_hash,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        passwordChangeRequired: user.password_change_required,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      return allUsers;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(users)
        .where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          ...user,
          role: user.role || "user"
        })
        .returning();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllClients(): Promise<Client[]> {
    try {
      // Gebruik directe SQL query om alle clients op te halen
      const result = await pool.query(
        'SELECT * FROM clients ORDER BY created_at DESC'
      );
      
      // Map de resultaten van snake_case naar camelCase
      return result.rows.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        contactPerson: client.contact_person,
        contactFunction: client.contact_function,
        address: client.address,
        industry: client.industry,
        status: client.status,
        notes: client.notes,
        createdAt: client.created_at
      }));
    } catch (error) {
      console.error("Error getting all clients:", error);
      return [];
    }
  }

  async getClientById(id: number): Promise<Client | undefined> {
    try {
      // Gebruik directe SQL query
      const result = await pool.query(
        'SELECT * FROM clients WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map van snake_case naar camelCase
      const client = result.rows[0];
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        contactPerson: client.contact_person,
        contactFunction: client.contact_function,
        address: client.address,
        industry: client.industry,
        status: client.status,
        notes: client.notes,
        createdAt: client.created_at
      };
    } catch (error) {
      console.error("Error getting client by ID:", error);
      return undefined;
    }
  }

  async createClient(client: InsertClient): Promise<Client> {
    try {
      console.log("Client toevoegen in database:", JSON.stringify(client, null, 2));
      
      // Basis validatie
      if (!client.name) {
        throw new Error("Naam is verplicht");
      }
      if (!client.email) {
        throw new Error("Email is verplicht");
      }
      
      // Directe SQL-query gebruiken
      const query = `
        INSERT INTO clients (
          name, email, phone, industry, address, contact_person, 
          contact_function, status, notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )
        RETURNING *
      `;
      
      // Bereid de parameters voor - zet camelCase om naar snake_case voor de database
      const params = [
        client.name,
        client.email,
        client.phone || "",
        client.industry || "",
        client.address || "",
        client.contactPerson || "",
        client.contactFunction || "",
        client.status || "active",
        client.notes || ""
      ];
      
      console.log("Executing client query with params:", params);
      
      // Voer de query uit
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        // Map van snake_case naar camelCase
        const client = result.rows[0];
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          contactPerson: client.contact_person,
          contactFunction: client.contact_function,
          address: client.address,
          industry: client.industry,
          status: client.status,
          notes: client.notes,
          createdAt: client.created_at
        };
      } else {
        throw new Error("No client was created");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    try {
      // Zet camelCase naar snake_case voor database
      const dbData: any = {};
      
      if (clientData.name) dbData.name = clientData.name;
      if (clientData.email) dbData.email = clientData.email;
      if (clientData.phone) dbData.phone = clientData.phone;
      if (clientData.industry) dbData.industry = clientData.industry;
      if (clientData.address) dbData.address = clientData.address;
      if (clientData.contactPerson) dbData.contact_person = clientData.contactPerson;
      if (clientData.contactFunction) dbData.contact_function = clientData.contactFunction;
      if (clientData.status) dbData.status = clientData.status;
      if (clientData.notes) dbData.notes = clientData.notes;
      
      // Direct SQL query om problemen met ORM te vermijden
      let setClause = Object.keys(dbData).map((key, i) => `${key} = $${i + 1}`).join(', ');
      setClause += `, updated_at = NOW()`;
      
      const query = `
        UPDATE clients 
        SET ${setClause}
        WHERE id = $${Object.keys(dbData).length + 1}
        RETURNING *
      `;
      
      const values = [...Object.values(dbData), id];
      const result = await pool.query(query, values);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return undefined;
    } catch (error) {
      console.error("Error updating client:", error);
      return undefined;
    }
  }

  async getAllCandidates(): Promise<Candidate[]> {
    try {
      // Gebruik een directe SQL-query om alle kandidaten op te halen
      // Dit geeft ons meer controle en laat zien wat er precies gebeurt
      const query = `
        SELECT * FROM candidates
        ORDER BY created_at DESC
      `;
      
      console.log("Executing query to fetch all candidates");
      const result = await pool.query(query);
      console.log(`Retrieved ${result.rows.length} candidates from database`);
      
      return result.rows;
    } catch (error) {
      console.error("Error getting all candidates:", error);
      return [];
    }
  }

  async getCandidateById(id: number): Promise<Candidate | undefined> {
    try {
      const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
      return candidate;
    } catch (error) {
      console.error("Error getting candidate by ID:", error);
      return undefined;
    }
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    try {
      console.log("=========== CREATECANDIDATE FUNCTIE ===========");
      console.log("Kandidaat toevoegen in database met data:", JSON.stringify(candidate, null, 2));
      
      // Basis validatie
      if (!candidate.firstName) {
        throw new Error("Voornaam is verplicht");
      }
      if (!candidate.lastName) {
        throw new Error("Achternaam is verplicht");
      }
      if (!candidate.email) {
        throw new Error("Email is verplicht");
      }
      
      // Directe SQL-query gebruiken voor transparantie en controle
      const query = `
        INSERT INTO candidates (
          first_name, last_name, email, phone, location, current_position, 
          profile, experience, education, skills, languages, certifications,
          hobbies, birth_date, summary, availability, linkedin_url, status, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *
      `;
      
      // Bereid de parameters voor - zet camelCase om naar snake_case voor de database
      const params = [
        candidate.firstName,
        candidate.lastName,
        candidate.email,
        candidate.phone || "",
        candidate.location || "",
        candidate.currentPosition || "",
        candidate.profile || "",
        JSON.stringify(candidate.experience || ""),
        JSON.stringify(candidate.education || ""),
        JSON.stringify(candidate.skills || []),
        JSON.stringify(candidate.languages || ""),
        JSON.stringify(candidate.certifications || []),
        candidate.hobbies || "",
        candidate.birthDate || "",
        candidate.summary || "",
        candidate.availability || "no",
        candidate.linkedinUrl || "",
        candidate.status || "active",
        candidate.notes || ""
      ];
      
      console.log("Executing query with params:", params);
      
      // Voer de query uit
      const result = await pool.query(query, params);
      
      console.log("Query result:", result.rows[0]);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new Error("No candidate was created");
      }
    } catch (error) {
      console.error("Error creating candidate:", error);
      throw error;
    }
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    try {
      // Zet camelCase naar snake_case voor database
      const dbData: any = {};
      
      if (candidateData.firstName) dbData.first_name = candidateData.firstName;
      if (candidateData.lastName) dbData.last_name = candidateData.lastName;
      if (candidateData.email) dbData.email = candidateData.email;
      if (candidateData.phone) dbData.phone = candidateData.phone;
      if (candidateData.location) dbData.location = candidateData.location;
      if (candidateData.currentPosition) dbData.current_position = candidateData.currentPosition;
      if (candidateData.profile) dbData.profile = candidateData.profile;
      if (candidateData.experience) dbData.experience = JSON.stringify(candidateData.experience);
      if (candidateData.education) dbData.education = JSON.stringify(candidateData.education);
      if (candidateData.skills) dbData.skills = JSON.stringify(candidateData.skills);
      if (candidateData.languages) dbData.languages = JSON.stringify(candidateData.languages);
      if (candidateData.certifications) dbData.certifications = JSON.stringify(candidateData.certifications);
      if (candidateData.hobbies) dbData.hobbies = candidateData.hobbies;
      if (candidateData.birthDate) dbData.birth_date = candidateData.birthDate;
      if (candidateData.summary) dbData.summary = candidateData.summary;
      if (candidateData.availability) dbData.availability = candidateData.availability;
      if (candidateData.linkedinUrl) dbData.linkedin_url = candidateData.linkedinUrl;
      if (candidateData.status) dbData.status = candidateData.status;
      if (candidateData.notes) dbData.notes = candidateData.notes;
      
      // Direct SQL query om problemen met ORM te vermijden
      let setClause = Object.keys(dbData).map((key, i) => `${key} = $${i + 1}`).join(', ');
      setClause += `, updated_at = NOW()`;
      
      const query = `
        UPDATE candidates 
        SET ${setClause}
        WHERE id = $${Object.keys(dbData).length + 1}
        RETURNING *
      `;
      
      const values = [...Object.values(dbData), id];
      const result = await pool.query(query, values);
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return undefined;
    } catch (error) {
      console.error("Error updating candidate:", error);
      return undefined;
    }
  }

  async getAllApplications(): Promise<Application[]> {
    try {
      return await db.select().from(applications).orderBy(desc(applications.createdAt));
    } catch (error) {
      console.error("Error getting all applications:", error);
      return [];
    }
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    try {
      const [application] = await db.select().from(applications).where(eq(applications.id, id));
      return application;
    } catch (error) {
      console.error("Error getting application by ID:", error);
      return undefined;
    }
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    try {
      const applicationWithStatus = {
        ...application,
        status: "pending"
      };
      
      const [newApplication] = await db
        .insert(applications)
        .values(applicationWithStatus)
        .returning();
      return newApplication;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    try {
      const [updatedApplication] = await db
        .update(applications)
        .set({
          status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(applications.id, id))
        .returning();
      return updatedApplication;
    } catch (error) {
      console.error("Error updating application status:", error);
      return undefined;
    }
  }

  async approveApplication(id: number): Promise<Candidate | undefined> {
    try {
      // First get the application
      const [application] = await db
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.id, id),
            eq(applications.status, "pending")
          )
        );
      
      if (!application) return undefined;
      
      // Update application status
      await db
        .update(applications)
        .set({
          status: "approved",
          updatedAt: new Date().toISOString()
        })
        .where(eq(applications.id, id));
      
      // Create candidate from application data
      const candidate: InsertCandidate = {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        currentPosition: application.currentPosition,
        skills: application.skills,
        experience: application.experience,
        education: application.education,
        certifications: application.certifications,
        languages: application.languages,
        hobbies: application.hobbies,
        birthDate: application.birthDate,
        summary: application.summary,
        availability: application.availability,
      };
      
      return this.createCandidate(candidate);
    } catch (error) {
      console.error("Error approving application:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();