import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════════════════
// SAVE PROMPT — Persist enhanced prompts to user's library in Postgres
// Called by the frontend "Save" button on Spark & Precision
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const {
            title,
            originalPrompt,
            enhancedPrompt,
            tags = [],
            tool = 'spark',
            platform,
            sections,
            isFavorite = false,
        } = body;

        if (!enhancedPrompt?.trim()) {
            return NextResponse.json(
                { error: 'Enhanced prompt is required' },
                { status: 400 }
            );
        }

        const prisma = getPrisma();
        const email = session.user.email.toLowerCase();

        // Find or create user
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: email.split('@')[0],
            },
            select: { id: true },
        });

        // Save the prompt
        const prompt = await prisma.prompt.create({
            data: {
                userId: user.id,
                originalPrompt: originalPrompt || null,
                fullPrompt: enhancedPrompt,
                task: sections?.mainObjective || originalPrompt?.slice(0, 200) || null,
                role: sections?.expertRole || null,
                instructions: sections?.approachGuidelines || null,
                output: sections?.outputFormat || null,
                title: title || originalPrompt?.slice(0, 80) || 'Untitled Prompt',
                tags: Array.isArray(tags) ? tags : [tags],
                tool: tool || 'spark',
                platform: platform || null,
                isFavorite,
            },
        });

        return NextResponse.json({
            success: true,
            promptId: prompt.id,
            message: 'Prompt saved to your library',
        });
    } catch (error) {
        console.error('Save prompt error:', error);
        return NextResponse.json(
            { error: 'Failed to save prompt' },
            { status: 500 }
        );
    }
}
