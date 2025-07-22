'use client'

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react'
import { processTranscript, setHighlightCallback } from './dom-actions'
import { getDOMContext, generateActionPlan, executeActionPlan, type AIActionPlan } from './ai-dom-actions'
import { useHighlight } from './highlight-context'
import { toast } from 'sonner'

interface EnhancedVoiceContextType {
  isRecording: boolean
  transcript: string
  isProcessing: boolean
  error: string | null
  lastActionPlan: AIActionPlan | null
  start: () => Promise<void>
  stop: () => void
}

interface EnhancedVoiceProviderProps {
  children: ReactNode
  apiPath?: string
  language?: string
  debug?: boolean
  useAI?: boolean
}

const EnhancedVoiceContext = createContext<EnhancedVoiceContextType | undefined>(undefined)

export function EnhancedVoiceProvider({ 
  children, 
  apiPath = '/api/voiceui/transcribe', 
  language,
  debug = false,
  useAI = true
}: EnhancedVoiceProviderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastActionPlan, setLastActionPlan] = useState<AIActionPlan | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { highlightElement } = useHighlight()

  useEffect(() => {
    setHighlightCallback(highlightElement)
  }, [highlightElement])

  async function processWithAI(transcript: string) {
    try {
      const domContext = getDOMContext()
      
      if (debug) {
        console.log('DOM Context:', domContext)
        console.log('User Query:', transcript)
      }

      if (domContext.length === 0) {
        toast.error('No interactive elements found on the page')
        return false
      }

      const actionPlan = await generateActionPlan(transcript, domContext)
      setLastActionPlan(actionPlan)

      if (debug) {
        console.log('Generated Action Plan:', actionPlan)
      }

      if (actionPlan.confidence < 0.3) {
        toast.error(`Low confidence (${(actionPlan.confidence * 100).toFixed(0)}%): ${actionPlan.reasoning}`)
        return false
      }

      // Validate that all target elements exist before execution
      const missingElements = actionPlan.steps.filter(step => {
        const element = document.querySelector(step.target)
        return !element
      })

      if (missingElements.length > 0) {
        const missing = missingElements.map(step => step.target).join(', ')
        console.error('Missing elements:', missingElements)
        console.log('Available elements with data-voice:', 
          Array.from(document.querySelectorAll('[data-voice]')).map(el => 
            `${el.getAttribute('data-voice')} -> ${(el as HTMLElement).tagName}#${el.id || el.className}`
          )
        )
        toast.error(`Elements not found: ${missing}`)
        return false
      }

      toast.info(`Executing plan: ${actionPlan.reasoning}`)

      const success = await executeActionPlan(actionPlan, (step, stepSuccess) => {
        if (debug) {
          console.log(`Step ${step.type} on ${step.target}: ${stepSuccess ? 'success' : 'failed'}`)
        }
        
        if (!stepSuccess) {
          toast.error(`Failed to ${step.description}`)
        }
      })

      window.dispatchEvent(new CustomEvent('voice-command', {
        detail: { 
          command: transcript, 
          result: success ? `AI executed ${actionPlan.steps.length} steps` : 'Some AI steps failed',
          status: success ? 'success' : 'error',
          processingType: 'ai',
          aiPlan: actionPlan
        }
      }))

      if (success) {
        toast.success('Action completed successfully!')
        return true
      } else {
        toast.error('Some actions failed to execute')
        return false
      }

    } catch (error) {
      console.error('AI processing error:', error)
      
      window.dispatchEvent(new CustomEvent('voice-command', {
        detail: { 
          command: transcript, 
          result: error instanceof Error ? error.message : 'AI processing failed',
          status: 'error',
          processingType: 'error'
        }
      }))
      
      toast.error('AI processing failed')
      return false
    }
  }

  const start = async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          
          if (language) {
            formData.append('language', language)
          }
          
          const response = await fetch(apiPath, {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Failed to transcribe audio')
          }
          
          const data = await response.json()
          setTranscript(data.transcript)
          
          if (debug) {
            console.log('Voice transcript:', data.transcript)
          }

          if (useAI) {
            await processWithAI(data.transcript)
          }
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMessage)
          console.error('Transcription error:', err)
          toast.error(errorMessage)
        } finally {
          setIsProcessing(false)
        }
        
        cleanup()
      }
      
      mediaRecorder.start(1000)
      setIsRecording(true)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
      console.error('Recording error:', err)
      toast.error(errorMessage)
    }
  }
  
  const stop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }
  
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
  }

  const value: EnhancedVoiceContextType = {
    isRecording,
    transcript,
    isProcessing,
    error,
    lastActionPlan,
    start,
    stop,
  }

  return (
    <EnhancedVoiceContext.Provider value={value}>
      {children}
    </EnhancedVoiceContext.Provider>
  )
}

export function useEnhancedVoice() {
  const context = useContext(EnhancedVoiceContext)
  
  if (context === undefined) {
    throw new Error('useEnhancedVoice must be used within an EnhancedVoiceProvider')
  }
  
  return context
} 