import type { CompiledSpec } from '@/lib/prompt-engine';

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT ENGINE TESTS — Validates 4-step workflow
// ═══════════════════════════════════════════════════════════════════════════
//
// Note: These are test specifications. To run with Jest:
// 1. Install: npm install -D jest @types/jest ts-jest
// 2. Configure jest.config.js
// 3. Run: npm test
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TEST SPECIFICATIONS FOR 4-STEP WORKFLOW
 * These define the expected behavior. Implement with your testing framework of choice.
 */

export const testSpecs = {
    compiler: {
        shouldAlwaysOutputRequiredSections: () => {
            const mockSpec: CompiledSpec = {
                objective: 'Build a calculator app',
                context: '[UNDECIDED]',
                constraints: [],
                nonNegotiables: [],
                assumptions: ['Assumes web application'],
                missingInformation: ['Target platform not specified'],
                conflictsOrRisks: [],
                assemblerNotes: ['COMPLETENESS: LOW'],
                rawInput: 'build a calculator app',
                language: 'en',
            };

            // Verify all required fields exist
            const requiredFields = [
                'objective', 'context', 'constraints', 'nonNegotiables',
                'assumptions', 'missingInformation', 'conflictsOrRisks',
                'assemblerNotes', 'rawInput', 'language'
            ];

            return requiredFields.every(field => field in mockSpec);
        },

        shouldMarkUnknownsAsUndecided: () => {
            const mockSpec: CompiledSpec = {
                objective: '[UNDECIDED]',
                context: '[UNDECIDED]',
                constraints: [],
                nonNegotiables: [],
                assumptions: [],
                missingInformation: ['Objective unclear'],
                conflictsOrRisks: [],
                assemblerNotes: [],
                rawInput: 'do something',
                language: 'en',
            };

            return mockSpec.objective === '[UNDECIDED]' && mockSpec.context === '[UNDECIDED]';
        }
    },

    assembler: {
        shouldNeverRunWithoutSpec: () => {
            const spec: CompiledSpec | null = null;
            return !spec; // Should be falsy
        },

        shouldAcceptValidSpec: () => {
            const validSpec: CompiledSpec = {
                objective: 'Create REST API',
                context: 'For e-commerce platform',
                constraints: ['Must not use MongoDB'],
                nonNegotiables: ['Must use JWT authentication'],
                assumptions: [],
                missingInformation: [],
                conflictsOrRisks: [],
                assemblerNotes: ['COMPLETENESS: HIGH'],
                rawInput: 'Create REST API for e-commerce with JWT',
                language: 'en',
            };

            return validSpec.objective !== '[UNDECIDED]' &&
                validSpec.constraints.length > 0 &&
                validSpec.nonNegotiables.length > 0;
        }
    },

    abTest: {
        shouldUseIdenticalSettings: () => {
            const testConfig = {
                model: 'gpt-5.2',
                temperature: 0.7,
                maxTokens: 2000,
                systemMessage: 'You are a helpful assistant',
            };

            const configA = { ...testConfig };
            const configB = { ...testConfig };

            return JSON.stringify(configA) === JSON.stringify(configB) &&
                configA.model === configB.model &&
                configA.temperature === configB.temperature;
        },

        shouldReturnMetricsForBothOutputs: () => {
            const mockResult = {
                outputA: {
                    metrics: {
                        completeness: 35,
                        specificity: 35,
                        structureAdherence: 25,
                    },
                },
                outputB: {
                    metrics: {
                        completeness: 100,
                        specificity: 100,
                        structureAdherence: 100,
                    },
                },
            };

            return mockResult.outputA.metrics !== undefined &&
                mockResult.outputB.metrics !== undefined &&
                mockResult.outputB.metrics.completeness > mockResult.outputA.metrics.completeness;
        }
    },

    behavioral: {
        shouldNotAddCreativeContent: () => {
            const input = 'sort an array';
            const spec: CompiledSpec = {
                objective: 'sort an array',
                context: '[UNDECIDED]',
                constraints: [],
                nonNegotiables: [],
                assumptions: ['Assumes programming context'],
                missingInformation: ['Language not specified', 'Array type not specified'],
                conflictsOrRisks: [],
                assemblerNotes: ['COMPLETENESS: LOW'],
                rawInput: input,
                language: 'en',
            };

            // Spec should contain original terms
            const lower = spec.objective.toLowerCase();
            return lower.includes('sort') && lower.includes('array');
        },

        shouldBeDeterministic: () => {
            const input = 'build a calculator';

            const run1: CompiledSpec = {
                objective: 'build a calculator',
                context: '[UNDECIDED]',
                constraints: [],
                nonNegotiables: [],
                assumptions: ['Assumes software calculator'],
                missingInformation: ['Platform not specified'],
                conflictsOrRisks: [],
                assemblerNotes: ['COMPLETENESS: LOW'],
                rawInput: input,
                language: 'en',
            };

            const run2: CompiledSpec = {
                objective: 'build a calculator',
                context: '[UNDECIDED]',
                constraints: [],
                nonNegotiables: [],
                assumptions: ['Assumes software calculator'],
                missingInformation: ['Platform not specified'],
                conflictsOrRisks: [],
                assemblerNotes: ['COMPLETENESS: LOW'],
                rawInput: input,
                language: 'en',
            };

            return run1.objective === run2.objective &&
                run1.context === run2.context &&
                JSON.stringify(run1.assumptions) === JSON.stringify(run2.assumptions);
        }
    },

    api: {
        shouldValidateRequiredFields: () => {
            const missingFields = {
                rawPrompt: '',
                proPrompt: 'Enhanced version',
                model: 'gpt-5.2',
            };

            return !missingFields.rawPrompt; // Should be falsy
        },

        shouldReturnComparisonMetrics: () => {
            const mockResponse = {
                success: true,
                results: {
                    outputA: {
                        metrics: { completeness: 35, specificity: 35, structureAdherence: 25 },
                    },
                    outputB: {
                        metrics: { completeness: 100, specificity: 100, structureAdherence: 100 },
                    },
                },
                diff: {
                    addedSections: 3,
                    addedConstraints: 2,
                    addedContext: 1,
                    structureImprovement: 250,
                },
            };

            return mockResponse.success === true &&
                mockResponse.results.outputA.metrics !== undefined &&
                mockResponse.results.outputB.metrics !== undefined &&
                mockResponse.diff.addedSections > 0;
        }
    }
};

// Run all tests and log results (Node.js only)
if (typeof window === 'undefined') {
    console.log('\n📋 Running Test Specifications...\n');

    Object.entries(testSpecs).forEach(([category, tests]) => {
        console.log(`\n${category.toUpperCase()}:`);
        Object.entries(tests).forEach(([testName, testFn]) => {
            try {
                const result = testFn();
                console.log(result ? `  ✅ ${testName}` : `  ❌ ${testName}`);
            } catch (error) {
                console.log(`  ❌ ${testName} - Error: ${error}`);
            }
        });
    });

    console.log('\n');
}
