import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Health Check Endpoint
 * 
 * Use this to monitor database connectivity
 * GET /api/health
 */
export async function GET() {
    try {
        // Simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;

        // Get connection info
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT count(*) as count FROM pg_stat_activity 
            WHERE datname = current_database()
        `;

        const activeConnections = Number(result[0]?.count || 0);

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            activeConnections,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code || 'UNKNOWN',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        }, { status: 503 });
    }
}
