# 4-STEP PROMPT ENGINE — Educational & Proof-Driven

## Overview

PRAXIS Spark now features a **4-step educational workflow** that proves prompt improvements through side-by-side A/B testing. Unlike Quick Mode (instant enhancement), the 4-Step Wizard makes the transformation process transparent and measurable.

---

## The 4-Step Flow

### **Step 1: Raw Prompt Input**

- **Purpose**: Capture the user's original prompt exactly as intended
- **User Action**: Paste or type their raw prompt
- **System Action**: Store as `raw_prompt` without modification
- **Output**: Stored input ready for analysis

```typescript
// Example input
raw_prompt = "build a todo app"
```

---

### **Step 2: Prompt Compiler (Decision Spec)**

- **Purpose**: Extract structure and surface unknowns WITHOUT creative enhancement
- **Process**: Run `compilePrompt()` from `/src/lib/prompt-engine.ts`
- **System Action**:
  - Extract objective (verbatim or mark `[UNDECIDED]`)
  - Extract context (verbatim or mark `[UNDECIDED]`)
  - Detect constraints, non-negotiables
  - Surface implicit assumptions
  - Identify missing information
  - Flag conflicts or risks
- **Behavioral Lock**: NO guessing, NO creative additions, NO ambiguity resolution
- **Output**: Structured `CompiledSpec` with all fields present

```typescript
interface CompiledSpec {
    objective: string;              // "build a todo app" or "[UNDECIDED]"
    context: string;                // "[UNDECIDED]" (no context provided)
    constraints: string[];          // [] (none detected)
    nonNegotiables: string[];       // [] (none detected)
    assumptions: string[];          // ["Assumes web application", "Assumes CRUD operations"]
    missingInformation: string[];   // ["Target platform not specified", "User auth requirements unclear"]
    conflictsOrRisks: string[];     // [] (no conflicts)
    assemblerNotes: string[];       // ["COMPLETENESS: LOW"]
    rawInput: string;               // Original input preserved
    language: string;               // "en"
}
```

**UI Display**:

- Show each section in an inspectable card
- Highlight warnings (assumptions, missing info) in amber
- Mark `[UNDECIDED]` values in gray italics
- Completeness indicator (LOW/MEDIUM/HIGH)

---

### **Step 3: Prompt Assembler (Pro Prompt)**

- **Purpose**: Mechanically assemble final prompt from spec using fixed templates
- **Process**: Run `assemblePrompt()` from `/src/lib/prompt-engine.ts`
- **System Action**:
  - Select template based on target model (GPT, Claude, Gemini, etc.)
  - Populate template with spec fields
  - Add structural sections (OBJECTIVE, CONTEXT, REQUIREMENTS, etc.)
  - Format for selected output language (English/Swedish)
- **Behavioral Lock**: NO creative enhancement, ONLY template population
- **Output**: `pro_prompt` ready for inference

```typescript
// Example assembled prompt
pro_prompt = `## OBJECTIVE
build a todo app

## CONTEXT
[No context provided]

## REQUIREMENTS
- Implement CRUD operations (Create, Read, Update, Delete)
- [Platform: UNDECIDED - specify web, mobile, or desktop]
- [Authentication: UNDECIDED - specify if user accounts required]

## OUTPUT FORMAT
Provide implementation plan with:
- Technology stack
- Core features
- Data model
- API endpoints (if applicable)

## ASSUMPTIONS DETECTED
- Assumes web application
- Assumes CRUD operations

## MISSING INFORMATION
- Target platform not specified
- User auth requirements unclear
`
```

**UI Display**:

- Show full assembled prompt in monospace font
- Highlight added structure vs original input
- "Copy" button for easy use

---

### **Step 4: A/B Result Preview (Proof)**

- **Purpose**: Prove the improvement by running BOTH prompts against the same model
- **Process**:
  1. Send `raw_prompt` to `/api/ai/ab-test`
  2. Send `pro_prompt` to `/api/ai/ab-test`
  3. Run both through **identical inference settings**:
     - Same model (e.g., gpt-5.2)
     - Same temperature (0.7)
     - Same max tokens (2000)
     - Same system messages
- **System Action**:
  - Execute both prompts
  - Validate outputs with 3 metrics:
    1. **Completeness**: Does output address all requirements?
    2. **Specificity**: Are constraints and formats explicit?
    3. **Structure Adherence**: Follows requested output format?
  - Calculate improvement delta
- **Output**: Side-by-side comparison with metrics

```typescript
interface ABResult {
    outputA: {
        prompt: string;      // raw_prompt
        output: string;      // LLM response to raw_prompt
        metrics: {
            completeness: 35,
            specificity: 35,
            structureAdherence: 25
        },
        label: "Raw Prompt"
    },
    outputB: {
        prompt: string;      // pro_prompt
        output: string;      // LLM response to pro_prompt
        metrics: {
            completeness: 100,
            specificity: 100,
            structureAdherence: 100
        },
        label: "Pro Prompt"
    },
    diff: {
        addedSections: 5,
        addedConstraints: 2,
        addedContext: 0,
        structureImprovement: 250  // character difference
    }
}
```

**UI Display**:

- **Metrics Bar Chart**: Show before/after comparison for each metric
- **Side-by-Side Outputs**:
  - Left panel: Output A (from raw prompt) with red accent
  - Right panel: Output B (from pro prompt) with green accent
- **Prompt Diff**: Visual summary of what changed
- **"Why This Improved" Section**: Bullet list derived from diff and spec:

  ```
  ✓ Added 5 structural sections for clarity
  ✓ Specified 2 explicit constraints
  ✓ Surfaced 2 implicit assumptions
  ✓ Declared 0 non-negotiable requirements
  ✓ Applied template-based structure

  Note: All improvements derived from spec analysis. No creative additions.
  ```

---

## Key Engineering Principles

### **1. Code-Level Separation**

```typescript
// Step 2: Compiler (extraction only)
function compilePrompt(rawPrompt: string): CompiledSpec {
    // Extract structure WITHOUT enhancement
    return {
        objective: extractObjective(rawPrompt),
        context: extractContext(rawPrompt),
        // ... all fields
    };
}

// Step 3: Assembler (template population only)
function assemblePrompt(spec: CompiledSpec, model: TargetModel): string {
    // Mechanically populate template
    const template = getTemplateForModel(model);
    return populateTemplate(template, spec);
}

// Step 4: A/B Test (identical inference)
async function run_ab_test(rawPrompt: string, proPrompt: string, model: string): Promise<ABResult> {
    const settings = { model, temperature: 0.7, maxTokens: 2000 };
    const [outputA, outputB] = await Promise.all([
        runLLM(rawPrompt, settings),
        runLLM(proPrompt, settings)
    ]);
    return compareOutputs(outputA, outputB);
}
```

### **2. Deterministic Behavior**

- Same `raw_prompt` → Same `CompiledSpec` (byte-for-byte identical)
- Same `CompiledSpec` + same `model` → Same `pro_prompt`
- Only Step 4 involves LLM stochasticity (controlled via temperature)

### **3. No Hidden Magic**

- Every transformation is visible and inspectable
- User can see exactly what changed and why
- Metrics are derived from observable structure, not vibes

---

## Testing Requirements

### **Unit Tests** (`/src/__tests__/prompt-engine-workflow.test.ts`)

```typescript
describe('4-Step Workflow', () => {
    it('Compiler: Always outputs required sections', () => {
        const spec = compilePrompt("build app");
        expect(spec).toHaveProperty('objective');
        expect(spec).toHaveProperty('context');
        // ... all 10 fields
    });

    it('Compiler: Marks unknowns as UNDECIDED', () => {
        const spec = compilePrompt("vague input");
        expect(spec.objective).toBe('[UNDECIDED]');
    });

    it('Assembler: Never runs without spec', () => {
        expect(() => assemblePrompt(null, 'gpt-4')).toThrow();
    });

    it('A/B Test: Uses identical settings', () => {
        const result = await run_ab_test(raw, pro, 'gpt-5.2');
        expect(result.outputA.settings).toEqual(result.outputB.settings);
    });
});
```

### **Integration Tests**

```bash
# Test full pipeline
curl -X POST http://localhost:3000/api/ai/enhance?stage=compile \
  -H "Content-Type: application/json" \
  -d '{"prompt":"build calculator"}'

curl -X POST http://localhost:3000/api/ai/enhance?stage=assemble \
  -H "Content-Type: application/json" \
  -d '{"spec":{...},"platform":"chatgpt"}'

curl -X POST http://localhost:3000/api/ai/ab-test \
  -H "Content-Type: application/json" \
  -d '{"rawPrompt":"...","proPrompt":"...","model":"gpt-5.2"}'
```

---

## UI/UX Flow

### **Progress Indicator** (Top of Page)

```
[✓] Raw Input ────── [●] Compile ────── [ ] Assemble ────── [ ] A/B Test
    Completed         Active              Pending             Pending
```

### **Step Navigation**

- **Back Button**: Return to previous step (preserves state)
- **Next Button**: Advance to next step (only enabled when current step complete)
- **Start Over**: Reset entire wizard to Step 1

### **Educational Elements**

- Each step has a **"Why this step?"** tooltip
- Compiler step shows **assumptions** and **missing info** prominently
- A/B results include **"What changed?"** diff view
- Metrics have **hover explanations**:
  - *Completeness*: "Does the output address all stated requirements?"
  - *Specificity*: "Are constraints, formats, and boundaries explicit?"
  - *Structure Adherence*: "Does the output follow the requested format?"

---

## API Endpoints

### **POST /api/ai/enhance?stage=compile**

Runs Step 2: Compiler only

**Request**:

```json
{
    "prompt": "build a todo app",
    "rawPrompt": "build a todo app"
}
```

**Response**:

```json
{
    "stage": "compile",
    "spec": {
        "objective": "build a todo app",
        "context": "[UNDECIDED]",
        "constraints": [],
        "nonNegotiables": [],
        "assumptions": ["Assumes web application"],
        "missingInformation": ["Platform not specified"],
        "conflictsOrRisks": [],
        "assemblerNotes": ["COMPLETENESS: LOW"],
        "rawInput": "build a todo app",
        "language": "en"
    }
}
```

### **POST /api/ai/enhance?stage=assemble**

Runs Step 3: Assembler only

**Request**:

```json
{
    "spec": { /* CompiledSpec */ },
    "platform": "chatgpt",
    "outputLanguage": "en"
}
```

**Response**:

```json
{
    "stage": "assemble",
    "assembledPrompt": "## OBJECTIVE\nbuild a todo app\n\n..."
}
```

### **POST /api/ai/ab-test**

Runs Step 4: A/B Test

**Request**:

```json
{
    "rawPrompt": "build a todo app",
    "proPrompt": "## OBJECTIVE\nbuild a todo app...",
    "model": "gpt-5.2",
    "spec": { /* CompiledSpec */ }
}
```

**Response**:

```json
{
    "success": true,
    "results": {
        "outputA": {
            "prompt": "build a todo app",
            "output": "Sure! Here's a basic todo app...",
            "metrics": { "completeness": 35, "specificity": 35, "structureAdherence": 25 },
            "label": "Raw Prompt"
        },
        "outputB": {
            "prompt": "## OBJECTIVE\nbuild a todo app...",
            "output": "# Todo App Implementation Plan\n\n## Overview...",
            "metrics": { "completeness": 100, "specificity": 100, "structureAdherence": 100 },
            "label": "Pro Prompt"
        }
    },
    "diff": {
        "addedSections": 5,
        "addedConstraints": 2,
        "addedContext": 0,
        "structureImprovement": 250
    },
    "model": "gpt-5.2",
    "timestamp": "2026-02-05T..."
}
```

---

## Files Changed/Created

### **New Files**

1. `/src/components/ui/PromptWizard.tsx` — 4-step wizard UI component
2. `/src/app/api/ai/ab-test/route.ts` — A/B testing endpoint
3. `/src/__tests__/prompt-engine-workflow.test.ts` — Test suite
4. `WIZARD-FLOW.md` — This documentation

### **Modified Files**

1. `/src/app/dashboard/spark/page.tsx` — Added mode selector (Quick/Wizard)

### **Existing Files (Unchanged)**

1. `/src/lib/prompt-engine.ts` — Core compiler/assembler (already implemented)
2. `/src/app/api/ai/enhance/route.ts` — Existing API (supports `?stage=compile` and `?stage=assemble`)

---

## Usage Example

```typescript
// User journey through 4 steps:

// Step 1: Input
const rawPrompt = "build me a todo app";

// Step 2: Compile
const response1 = await fetch('/api/ai/enhance?stage=compile', {
    method: 'POST',
    body: JSON.stringify({ prompt: rawPrompt })
});
const { spec } = await response1.json();
// spec.assumptions = ["Assumes web app", "Assumes CRUD"]
// spec.missingInformation = ["Platform unclear"]

// Step 3: Assemble
const response2 = await fetch('/api/ai/enhance?stage=assemble', {
    method: 'POST',
    body: JSON.stringify({ spec, platform: 'chatgpt', outputLanguage: 'en' })
});
const { assembledPrompt } = await response2.json();

// Step 4: A/B Test
const response3 = await fetch('/api/ai/ab-test', {
    method: 'POST',
    body: JSON.stringify({ rawPrompt, proPrompt: assembledPrompt, model: 'gpt-5.2', spec })
});
const { results, diff } = await response3.json();

// Show side-by-side:
console.log('Raw Output Score:',
    (results.outputA.metrics.completeness +
     results.outputA.metrics.specificity +
     results.outputA.metrics.structureAdherence) / 3
); // ~32%

console.log('Pro Output Score:',
    (results.outputB.metrics.completeness +
     results.outputB.metrics.specificity +
     results.outputB.metrics.structureAdherence) / 3
); // ~100%

console.log('Improvement:', diff.structureImprovement, 'characters added');
```

---

## Educational Goals

### **For Users**

1. **Transparency**: See exactly what the compiler extracted
2. **Learning**: Understand what makes a good prompt (constraints, context, format)
3. **Proof**: Objective metrics show improvement, not subjective claims
4. **Control**: Can inspect and modify at each step

### **For Product**

1. **Trust**: No black-box magic, all transformations visible
2. **Debugging**: Can diagnose issues at each step
3. **Iteration**: Easy to improve compiler or assembler independently
4. **Metrics**: Can track which improvements matter most

---

## Next Steps (Future Enhancements)

1. **Edit Spec Before Assembly**: Let users modify the compiled spec
2. **Multi-Model A/B**: Run against GPT-5.2 AND Claude Sonnet simultaneously
3. **History Tracking**: Save A/B results for later comparison
4. **Collaborative Mode**: Share specs and results with team
5. **Prompt Library**: Save high-scoring pro prompts as templates
6. **Advanced Metrics**: Add readability, token efficiency, error handling coverage

---

## Maintenance Notes

### **When adding new models**

1. Update `platformMap` in [spark/page.tsx](../src/app/dashboard/spark/page.tsx)
2. Add template in `prompt-engine.ts` assembler
3. Test A/B endpoint with new model

### **When changing metrics**

1. Update validation logic in [ab-test/route.ts](../src/app/api/ai/ab-test/route.ts)
2. Update UI display in [PromptWizard.tsx](../src/components/ui/PromptWizard.tsx)
3. Update tests in [prompt-engine-workflow.test.ts](../src/__tests__/prompt-engine-workflow.test.ts)

### **When improving compiler**

1. Modify extraction functions in `prompt-engine.ts`
2. Ensure deterministic behavior (same input → same output)
3. Add tests for new patterns
4. Document behavioral changes

---

**Last Updated**: February 5, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
