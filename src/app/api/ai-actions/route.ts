import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { aiActionsSchema, validateOrigin, corsHeaders } from '@/lib/validation'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin)
  })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { error: 'Forbidden origin' },
        { status: 403, headers: corsHeaders(origin) }
      )
    }

    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const validationResult = aiActionsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const { userQuery, domContext } = validationResult.data

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    const systemPrompt = `You are a voice UI assistant that helps users interact with web pages through natural language commands. 

Your job is to analyze user queries and generate step-by-step action plans to accomplish their goals using the available DOM elements.

CRITICAL RULES:
1. ONLY use elements that actually exist in the DOM context provided below
2. Do NOT create fictional selectors or data-voice attributes
3. Use the exact 'path' selector provided for each element
4. For dropdowns/selects, use the element's path and provide the desired value
5. If an exact match isn't available, find the closest existing element

Available DOM elements:
${JSON.stringify(domContext, null, 2)}

Available action types:
- click: Click on an element
- type: Type text into an input field  
- select: Select an option from a dropdown (use value parameter for the option)
- focus: Focus on an element
- scroll: Scroll to an element
- wait: Wait for a specified time (milliseconds)
- custom: Custom action with description

IMPORTANT: 
- For color selection, look for elements with data-voice containing "color" and use 'select' action with the desired color as value
- For play/pause, look for elements with data-voice containing "play" or "music"
- Always use the exact 'path' from the DOM element, never create new selectors
- If you can't find an exact match, explain why in your reasoning and set confidence low

Examples:
- "Select blue color" → Find color selector element, use select action with value "blue"
- "Play music" → Find music/play element, use click action
- "Send message Hi Mom" → Focus message input, type "Hi Mom", click send button

Return a confidence score (0-1) and reasoning for your plan.`

    const result = await generateObject({
      model: groq('llama-3.1-8b-instant'),
      prompt: `User query: "${userQuery}"\n\nGenerate an action plan to accomplish this request using the available DOM elements.`,
      system: systemPrompt,
      schema: z.object({
        steps: z.array(z.object({
          type: z.enum(['click', 'type', 'select', 'focus', 'scroll', 'wait', 'custom']),
          target: z.string().describe('CSS selector path to target element'),
          value: z.string().optional().describe('Value to input/select if applicable'),
          description: z.string().describe('Clear description of what this step does')
        })),
        confidence: z.number().min(0).max(1).describe('Confidence score for the action plan'),
        reasoning: z.string().describe('Explanation of why this action plan was chosen')
      })
    })

    return NextResponse.json(result.object, {
      headers: corsHeaders(origin)
    })

  } catch (error) {
    console.error('AI actions API error:', error)
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429, headers: corsHeaders(origin) }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate action plan' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
} 