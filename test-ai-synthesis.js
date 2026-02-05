#!/usr/bin/env node

/**
 * Test script for AI-synthesized prompt generation
 *
 * Tests the core transformation from vague to expert-level prompts
 */

const testCases = [
    {
        name: 'Chin-ups (Swedish)',
        input: 'hur blir jag bra på chins?',
        language: 'sv',
    },
    {
        name: 'Email (English)',
        input: 'write an email to my boss about being late tomorrow',
        language: 'en',
    },
    {
        name: 'Cooking app (English)',
        input: 'build me an app for cooking',
        language: 'en',
    },
];

async function testEnhancement(testCase) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST: ${testCase.name}`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Original: "${testCase.input}"`);
    console.log(`Language: ${testCase.language}\n`);

    const startTime = Date.now();

    try {
        const response = await fetch('http://localhost:3000/api/ai/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: testCase.input,
                outputLanguage: testCase.language,
            }),
        });

        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            const error = await response.json();
            console.error(`❌ FAILED: ${error.error}`);
            if (error.reason) console.error(`   Reason: ${error.reason}`);
            return false;
        }

        const data = await response.json();

        console.log(`✓ Success in ${elapsed}ms\n`);
        console.log(`Enhanced Prompt:`);
        console.log(`${'-'.repeat(80)}`);
        console.log(data.enhanced);
        console.log(`${'-'.repeat(80)}\n`);

        if (data.quality) {
            console.log(`Quality Metrics:`);
            console.log(`  Score: ${data.quality.score}/100`);
            console.log(`  Specificity: ${data.quality.specificityMultiplier}×`);
            console.log(`  Meets Bar: ${data.quality.meetsBar ? '✓' : '✗'}`);
        }

        console.log(`\nMeta:`);
        console.log(`  Original Length: ${data.meta?.originalLength || 'N/A'}`);
        console.log(`  Enhanced Length: ${data.meta?.enhancedLength || 'N/A'}`);
        console.log(`  Mode: ${data.mode}`);
        console.log(`  Version: ${data.meta?.pipelineVersion || 'N/A'}`);

        return true;

    } catch (error) {
        console.error(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('PRAXIS AI-Synthesized Prompt Generation Tests');
    console.log('='.repeat(80));

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const success = await testEnhancement(testCase);
        if (success) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`${'='.repeat(80)}\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
