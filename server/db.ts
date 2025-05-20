import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Expliciet de connection string voor TECNARIT_HR database instellen
const DATABASE_URL = "postgresql://tecnarithr_owner:npg_xm9MZVtKS0RN@ep-gentle-morning-a2by943a-pooler.eu-central-1.aws.neon.tech/TECNARIT_HR?sslmode=require";

export const pool = new Pool({ connectionString: DATABASE_URL });

// Log a message to confirm which database we're using
pool.query('SELECT current_database()')
  .then((res) => {
    console.log(`Connected to database: ${res.rows[0].current_database}`);
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

export const db = drizzle(pool, { schema });