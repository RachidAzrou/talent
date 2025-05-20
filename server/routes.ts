import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-db"; // Importeer de storage voor Neon DB
import { pool, db } from "./db"; // Importeer de database pool
import { loginSchema, insertClientSchema, insertCandidateSchema, insertApplicationSchema, insertUserSchema } from "@shared/schema";
import express from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import createMemoryStore from "memorystore";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import multer from "multer";

const JWT_SECRET = process.env.JWT_SECRET || "talentforge-secret-key";

// Zorg ervoor dat de uploads folder bestaat
const uploadsDir = path.join(process.cwd(), "uploads");
const templatesDir = path.join(uploadsDir, "templates");
const logosDir = path.join(uploadsDir, "logos");

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Configureer bestandsopslag
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    // Bepaal de map op basis van het bestandstype
    if (file.fieldname === "logo") {
      cb(null, logosDir);
    } else if (file.fieldname === "template") {
      cb(null, templatesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // Maak een unieke bestandsnaam met timestamp en originele extensie
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

// Maak multer uploader aan
const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limiet bestanden tot 5MB
  }
});

// Voeg de user property toe aan Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Function to validate if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  // Probeer eerst uit authorization header (voor API calls)
  let token = req.headers.authorization?.split(" ")[1];
  
  // Als geen token in headers, probeer dan uit sessie (voor browser requests)
  if (!token && req.session && req.session.token) {
    token = req.session.token;
  }
  
  if (!token) {
    console.log("No token found in request, headers:", req.headers);
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verificatie mislukt:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const MemoryStore = createMemoryStore(session);

  // Set up session
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: JWT_SECRET
  }));
  
  // Utility function for error handling
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  };
  
  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(credentials.email);
      
      // For debugging
      console.log("Login attempt:", { email: credentials.email });
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password with bcrypt
      const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: `${user.firstName} ${user.lastName}`,
          role: user.role || 'user' // Add role to the token
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Sla het token op in de sessie
      if (req.session) {
        req.session.token = token;
        req.session.userId = user.id;
        console.log("Token opgeslagen in sessie");
      } else {
        console.log("Geen sessie beschikbaar om token in op te slaan");
      }
      
      // Send user info and token
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'user', // Include user role in the response
        },
        token
      });
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Check authentication status
  app.get('/api/auth/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get the user id from the token
      const userId = (req.user as any).id;
      
      // Fetch the full user details from the database
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the full user details (without the password)
      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role || 'user',
          passwordChangeRequired: user.passwordChangeRequired || false
        } 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Change password endpoint
  app.post('/api/auth/change-password', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the user id from the token
      const userId = (req.user as any).id;
      
      // Fetch the user from database
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the user with the new password and mark passwordChangeRequired as false
      await storage.updateUser(userId, {
        passwordHash: newPasswordHash,
        passwordChangeRequired: false
      });
      
      // Return success
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ======= CLIENT ENDPOINTS =======
  
  // Get all clients
  app.get('/api/clients', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve clients" });
    }
  });
  
  // Get client by ID
  app.get('/api/clients/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClientById(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve client" });
    }
  });
  
  // Create client
  app.post('/api/clients', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("POST /api/clients request received, body:", req.body);
      console.log("Authentication user:", req.user);
      
      let clientData;
      try {
        clientData = insertClientSchema.parse(req.body);
        console.log("Parsed client data:", clientData);
      } catch (zodError) {
        console.error("Validation error:", zodError);
        return handleZodError(zodError, res);
      }
      
      try {
        const newClient = await storage.createClient(clientData);
        console.log("Client created successfully:", newClient);
        res.status(201).json(newClient);
      } catch (dbError) {
        console.error("Error creating client in storage:", dbError);
        return res.status(500).json({ 
          message: "Failed to create client in database", 
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }
    } catch (error) {
      console.error("Unhandled error in client creation:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Special debug endpoint for client creation - temporary
  app.post('/api/debug/clients/add', async (req: Request, res: Response) => {
    try {
      console.log("DEBUG client creation endpoint called");
      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      
      // Parse client data
      let clientData;
      try {
        clientData = insertClientSchema.parse(req.body);
      } catch (zodError) {
        console.error("DEBUG Validation error:", zodError);
        return res.status(400).json({ 
          message: "Validation failed", 
          error: zodError instanceof Error ? zodError.message : String(zodError) 
        });
      }
      
      // Create client directly
      try {
        const newClient = await storage.createClient(clientData);
        console.log("DEBUG Client created successfully:", newClient);
        return res.status(201).json(newClient);
      } catch (dbError) {
        console.error("DEBUG Database error:", dbError);
        return res.status(500).json({ 
          message: "Database error", 
          error: dbError instanceof Error ? dbError.message : String(dbError) 
        });
      }
    } catch (error) {
      console.error("DEBUG Unhandled error:", error);
      return res.status(500).json({ 
        message: "Unexpected error", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update client
  app.put('/api/clients/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, clientData);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Delete client
  app.delete('/api/clients/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteClient(id);
      
      if (!result) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });
  
  // ======= CANDIDATE ENDPOINTS =======
  
  // Get all candidates
  app.get('/api/candidates', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      console.log("Handling GET /api/candidates request");
      
      // Let's log the entire error to see what's happening
      try {
        // Use pool directly with the complete error shown
        const result = await pool.query("SELECT * FROM candidates");
        console.log(`Found ${result.rows.length} candidates`);
        res.json(result.rows);
      } catch (dbError) {
        // Volledige foutmelding loggen
        console.error("Complete database error:", dbError);
        return res.status(500).json({ 
          message: "Database error while retrieving candidates", 
          error: dbError instanceof Error ? dbError.message : String(dbError) 
        });
      }
    } catch (error) {
      console.error("General error in candidates endpoint:", error);
      res.status(500).json({ message: "Failed to retrieve candidates" });
    }
  });
  
  // Get candidate by ID
  app.get('/api/candidates/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.getCandidateById(id);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve candidate" });
    }
  });
  
  // Create candidate
  app.post('/api/candidates', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("======== TOEVOEGEN NIEUWE KANDIDAAT ========");
      console.log("Ontvangen kandidaat data:", JSON.stringify(req.body, null, 2));
      
      // Converteer van camelCase naar snake_case voor de database
      const preparedData = {
        first_name: req.body.firstName || req.body.first_name,
        last_name: req.body.lastName || req.body.last_name,
        email: req.body.email,
        phone: req.body.phone || "",
        location: req.body.location || "",
        currentPosition: req.body.currentPosition || "",
        profile: req.body.profile || "",
        // Ensure these are stored as JSON
        experience: typeof req.body.experience === 'string' ? req.body.experience : JSON.stringify(req.body.experience || ""),
        education: typeof req.body.education === 'string' ? req.body.education : JSON.stringify(req.body.education || ""),
        skills: Array.isArray(req.body.skills) ? req.body.skills : [],
        languages: typeof req.body.languages === 'string' ? req.body.languages : JSON.stringify(req.body.languages || ""),
        certifications: typeof req.body.certifications === 'string' ? req.body.certifications : JSON.stringify(req.body.certifications || []),
        hobbies: req.body.hobbies || "",
        birthDate: req.body.birthDate || "",
        summary: req.body.summary || "",
        availability: req.body.isAvailable === true || req.body.isAvailable === "yes" ? "yes" : "no",
        linkedinUrl: req.body.linkedinUrl || "",
        status: req.body.status || "active",
        notes: req.body.notes || "",
        resumePath: req.body.resumePath || "",
        updatedAt: new Date()
      };
      
      console.log("Prepared candidate data:", JSON.stringify(preparedData, null, 2));
      
      // Gebruik de standaard storage methode met uitgebreide logging
      console.log("Voorbereid kandidaat-data:", preparedData);
      
      // Creëer een object met de juiste veldnamen voor de database (snake_case)
      const candidateData = {
        first_name: preparedData.first_name,
        last_name: preparedData.last_name,
        email: preparedData.email,
        phone: preparedData.phone || '',
        location: preparedData.location || '',
        current_position: preparedData.currentPosition || '',
        profile: preparedData.profile || '',
        experience: preparedData.experience,
        education: preparedData.education,
        skills: preparedData.skills,
        languages: preparedData.languages,
        certifications: preparedData.certifications,
        hobbies: preparedData.hobbies || '',
        birth_date: preparedData.birthDate || null,
        summary: preparedData.summary || '',
        availability: preparedData.availability || 'no',
        linkedin_url: preparedData.linkedinUrl || '',
        status: preparedData.status || 'active',
        notes: preparedData.notes || ''
      };
      
      console.log("Data klaar voor opslag:", candidateData);
      const newCandidate = await storage.createCandidate(candidateData);
      
      console.log("Kandidaat succesvol toegevoegd:", newCandidate);
      res.status(201).json(newCandidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      return handleZodError(error, res);
    }
  });
  
  // Update candidate
  app.put('/api/candidates/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const candidateData = insertCandidateSchema.partial().parse(req.body);
      const updatedCandidate = await storage.updateCandidate(id, candidateData);
      
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(updatedCandidate);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Delete candidate
  app.delete('/api/candidates/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteCandidate(id);
      
      if (!result) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json({ success: true, message: "Candidate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });
  
  // Special debug endpoint for candidate creation (no auth required)
  app.post('/api/debug/candidates/add', async (req: Request, res: Response) => {
    try {
      console.log("DEBUG: Kandidaat endpoint aangeroepen");
      console.log("Request body:", req.body);
      
      // Map camelCase to snake_case for database
      const candidateData: any = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || "",
        location: req.body.location || "",
        current_position: req.body.currentPosition || "",
        profile: req.body.profile || "",
        experience: req.body.experience,
        education: req.body.education,
        skills: req.body.skills || [],
        languages: req.body.languages,
        certifications: req.body.certifications,
        hobbies: req.body.hobbies || "",
        birth_date: req.body.birthDate || "",
        summary: req.body.summary || "",
        availability: req.body.availability || "no",
        linkedin_url: req.body.linkedinUrl || "",
        status: req.body.status || "active",
        notes: req.body.notes || "",
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log("DEBUG: Voorbereide kandidaatdata:", candidateData);
      
      try {
        // Voer een directe insert uit
        const query = `
          INSERT INTO candidates (
            first_name, last_name, email, phone, location, current_position,
            profile, experience, education, skills, languages, certifications,
            hobbies, birth_date, summary, availability, linkedin_url, status,
            notes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
          )
          RETURNING *
        `;
        
        const params = [
          candidateData.first_name,
          candidateData.last_name,
          candidateData.email,
          candidateData.phone,
          candidateData.location,
          candidateData.current_position,
          candidateData.profile,
          candidateData.experience,
          candidateData.education,
          candidateData.skills,
          candidateData.languages,
          candidateData.certifications,
          candidateData.hobbies,
          candidateData.birth_date,
          candidateData.summary,
          candidateData.availability,
          candidateData.linkedin_url,
          candidateData.status,
          candidateData.notes
        ];
        
        const result = await pool.query(query, params);
        
        if (result.rows.length > 0) {
          const newCandidate = result.rows[0];
          
          // Map snake_case terug naar camelCase voor frontend
          const responseData = {
            id: newCandidate.id,
            firstName: newCandidate.first_name,
            lastName: newCandidate.last_name,
            email: newCandidate.email,
            phone: newCandidate.phone,
            location: newCandidate.location,
            currentPosition: newCandidate.current_position,
            profile: newCandidate.profile,
            experience: newCandidate.experience,
            education: newCandidate.education,
            skills: newCandidate.skills,
            languages: newCandidate.languages,
            certifications: newCandidate.certifications,
            hobbies: newCandidate.hobbies,
            birthDate: newCandidate.birth_date,
            summary: newCandidate.summary,
            availability: newCandidate.availability,
            linkedinUrl: newCandidate.linkedin_url,
            status: newCandidate.status,
            notes: newCandidate.notes,
            createdAt: newCandidate.created_at,
            updatedAt: newCandidate.updated_at
          };
          
          console.log("DEBUG: Kandidaat succesvol aangemaakt:", responseData);
          return res.status(201).json(responseData);
        }
        
        throw new Error("Failed to create candidate");
      } catch (dbError) {
        console.error("Database error bij aanmaken kandidaat:", dbError);
        return res.status(500).json({
          message: "Database error",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }
    } catch (error) {
      console.error("Algemene fout bij aanmaken kandidaat:", error);
      return res.status(500).json({
        message: "Unexpected error",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // ======= APPLICATION ENDPOINTS =======
  
  // Get all applications
  app.get('/api/applications', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve applications" });
    }
  });
  
  // Get application by ID
  app.get('/api/applications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve application" });
    }
  });
  
  // Submit application (public endpoint)
  app.post('/api/applications/submit', async (req: Request, res: Response) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const newApplication = await storage.createApplication(applicationData);
      res.status(201).json(newApplication);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  
  // Approve application
  app.post('/api/applications/:id/approve', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.approveApplication(id);
      
      if (!candidate) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json({ message: "Application approved", candidate });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve application" });
    }
  });
  
  // Reject application
  app.post('/api/applications/:id/reject', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.updateApplicationStatus(id, 'rejected');
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json({ message: "Application rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject application" });
    }
  });
  
  // Delete application
  app.delete('/api/applications/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteApplication(id);
      
      if (!result) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Create an upload directory for resumes if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // ======= USER MANAGEMENT ENDPOINTS (ADMIN ONLY) =======
  
  // Check if user is admin
  function isAdmin(req: Request, res: Response, next: Function) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  }

  // Get all users (admin only)
  app.get('/api/users', isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password hashes before sending to client
      const sanitizedUsers = users.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  // Create user (admin only)
  app.post('/api/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { password, ...userData } = req.body;

      // Validate that password is provided
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      // Generate password hash
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Validate all user data
      const userDataWithHash = insertUserSchema.parse({
        ...userData,
        passwordHash
      });
      
      // Check if user with same email or username already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "User with this email or username already exists" });
      }
      
      const newUser = await storage.createUser(userDataWithHash);
      
      // Remove password hash before sending response
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  // Update user (admin only)
  app.put('/api/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Don't allow changing user's own role
      if (req.user.id === id && userData.role && userData.role !== req.user.role) {
        return res.status(403).json({ message: "Cannot change your own role" });
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password hash before sending response
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  // Delete user (admin only)
  app.delete('/api/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow deleting your own account
      if (req.user.id === id) {
        return res.status(403).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Bestandsupload routes
  // Logo upload endpoint
  app.post('/api/upload/logo', isAuthenticated, upload.single('logo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Stuur de URL terug van het opgeslagen bestand
      const fileUrl = `/uploads/logos/${req.file.filename}`;
      
      res.status(200).json({ 
        message: "Logo uploaded successfully", 
        fileUrl: fileUrl,
        fileName: req.file.filename
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });
  
  // Template upload endpoint
  app.post('/api/upload/template', isAuthenticated, upload.single('template'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/templates/${req.file.filename}`;
      
      res.status(200).json({ 
        message: "Template uploaded successfully", 
        fileUrl: fileUrl,
        fileName: req.file.filename
      });
    } catch (error) {
      console.error("Error uploading template:", error);
      res.status(500).json({ message: "Failed to upload template" });
    }
  });
  
  // Route om opgeslagen templates te bekijken
  app.get('/api/templates', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const files = fs.readdirSync(templatesDir);
      const templates = files.map(file => ({
        name: file,
        url: `/uploads/templates/${file}`
      }));
      
      res.status(200).json(templates);
    } catch (error) {
      console.error("Error getting templates:", error);
      res.status(500).json({ message: "Failed to retrieve templates" });
    }
  });
  
  // Route om template-instellingen op te slaan
  app.post('/api/templates/settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const settingsData = req.body;
      
      // Maak een unieke bestandsnaam voor de gebruiker
      const fileName = `template-settings-${userId}.json`;
      const filePath = path.join(templatesDir, fileName);
      
      // Schrijf de instellingen naar een bestand
      fs.writeFileSync(filePath, JSON.stringify(settingsData, null, 2));
      
      res.status(200).json({ 
        message: "Template settings saved successfully",
        fileName: fileName
      });
    } catch (error) {
      console.error("Error saving template settings:", error);
      res.status(500).json({ message: "Failed to save template settings" });
    }
  });
  
  // Route om template-instellingen op te halen
  app.get('/api/templates/settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const fileName = `template-settings-${userId}.json`;
      const filePath = path.join(templatesDir, fileName);
      
      if (fs.existsSync(filePath)) {
        const settingsData = fs.readFileSync(filePath, 'utf8');
        res.status(200).json(JSON.parse(settingsData));
      } else {
        // Als er geen instellingen zijn opgeslagen, stuur een lege response
        res.status(404).json({ message: "No template settings found" });
      }
    } catch (error) {
      console.error("Error retrieving template settings:", error);
      res.status(500).json({ message: "Failed to retrieve template settings" });
    }
  });
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  return httpServer;
}
