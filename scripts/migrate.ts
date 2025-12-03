import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';

async function migrate() {
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Defined' : 'Undefined');
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../lib/db');

    console.log('Running migration...');
    try {
        const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await db.query(schema);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
