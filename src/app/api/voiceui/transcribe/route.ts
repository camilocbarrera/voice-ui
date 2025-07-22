import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { transcribeSchema, validateOrigin, corsHeaders } from '@/lib/validation'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin)
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Forbidden origin' },
        { status: 403, headers: corsHeaders(origin) }
      )
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    const formData = await request.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || undefined

    const validationResult = transcribeSchema.safeParse({
      audio: audioFile,
      language
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const { audio: validatedAudio, language: validatedLanguage } = validationResult.data

    const transcription = await openai.audio.transcriptions.create({
      file: validatedAudio,
      model: 'whisper-1',
      language: validatedLanguage,
    })

    return NextResponse.json({
      transcript: transcription.text,
    }, {
      headers: corsHeaders(origin)
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429, headers: corsHeaders(origin) }
        )
      }
      
      if (error.message.includes('invalid') || error.message.includes('format')) {
        return NextResponse.json(
          { error: 'Invalid audio format. Please use a supported audio file.' },
          { status: 400, headers: corsHeaders(origin) }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
} 