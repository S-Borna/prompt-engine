import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/prompts — Fetch user's saved prompts from Postgres
// Used by History and Library pages to display persistent data
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
        const offset = parseInt(searchParams.get('offset') || '0');
        const tool = searchParams.get('tool'); // 'spark' | 'precision' | null (all)
        const search = searchParams.get('search');
        const favorites = searchParams.get('favorites') === 'true';

        const prisma = getPrisma();
        const email = session.user.email.toLowerCase();

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ prompts: [], total: 0 });
        }

        // Build where clause
        const where: Record<string, unknown> = { userId: user.id };

        if (tool) {
            where.tool = tool;
        }

        if (favorites) {
            where.isFavorite = true;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { fullPrompt: { contains: search, mode: 'insensitive' } },
                { originalPrompt: { contains: search, mode: 'insensitive' } },
                { task: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Fetch prompts + total count in parallel
        const [prompts, total] = await Promise.all([
            prisma.prompt.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    originalPrompt: true,
                    fullPrompt: true,
                    task: true,
                    role: true,
                    instructions: true,
                    output: true,
                    title: true,
                    tags: true,
                    tool: true,
                    platform: true,
                    isFavorite: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.prompt.count({ where }),
        ]);

        return NextResponse.json({
            prompts: prompts.map((p) => ({
                id: p.id,
                title: p.title || 'Untitled',
                originalPrompt: p.originalPrompt || '',
                enhancedPrompt: p.fullPrompt,
                sections: {
                    expertRole: p.role || '',
                    mainObjective: p.task || '',
                    approachGuidelines: p.instructions || '',
                    outputFormat: p.output || '',
                },
                tags: p.tags,
                tool: p.tool || 'spark',
                platform: p.platform,
                isFavorite: p.isFavorite,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Fetch prompts error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompts' },
            { status: 500 }
        );
    }
}
