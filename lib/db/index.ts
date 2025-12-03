import { Pool, QueryResult } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
};

// Helper to mimic the sql template literal for compatibility
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult> {
    let text = '';
    const params: any[] = [];

    strings.forEach((str, i) => {
        text += str;
        if (i < values.length) {
            params.push(values[i]);
            text += `$${params.length}`;
        }
    });

    return pool.query(text, params);
}

// Add a query method to sql function to support sql.query() usage if needed, 
// though it's better to use db.query or the tag function directly.
// For now, let's ensure we export what's needed.
(sql as any).query = (text: string, params?: any[]) => pool.query(text, params);

