import { prisma } from '@/lib/db';

// In-memory cache for distributor lookups (expires after 5 minutes)
interface CacheEntry {
    id: string;
    timestamp: number;
}

const distributorCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get distributor ID by email with caching for faster repeated lookups
 */
export async function getDistributorIdByEmail(email: string): Promise<string | null> {
    // Check cache first
    const cached = distributorCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.id;
    }

    // Cache miss - fetch from database
    const distributor = await prisma.distributor.findUnique({
        where: { email },
        select: { id: true },
    });

    if (!distributor) {
        return null;
    }

    // Store in cache
    distributorCache.set(email, {
        id: distributor.id,
        timestamp: Date.now(),
    });

    return distributor.id;
}

/**
 * Clear cache for a specific email or all entries
 */
export function clearDistributorCache(email?: string): void {
    if (email) {
        distributorCache.delete(email);
    } else {
        distributorCache.clear();
    }
}

/**
 * Periodically clean expired cache entries (call this from a background task if needed)
 */
export function cleanExpiredCache(): void {
    const now = Date.now();
    for (const [email, entry] of distributorCache.entries()) {
        if (now - entry.timestamp >= CACHE_TTL) {
            distributorCache.delete(email);
        }
    }
}
