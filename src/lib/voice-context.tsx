'use client'

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react'
import { processTranscript, setHighlightCallback } from './dom-actions'
import { useHighlight } from './highlight-context'

interface VoiceContextType {
  isRecording: boolean
  transcript: string
  isProcessing: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

interface VoiceProviderProps {
  children: ReactNode
  apiPath?: string
  language?: string
  debug?: boolean
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export function VoiceProvider({ 
  children, 
  apiPath = '/api/voiceui/transcribe', 
  language,
  debug = false 
}: VoiceProviderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { highlightElement } = useHighlight()

  useEffect(() => {
    setHighlightCallback(highlightElement)
  }, [highlightElement])

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

          processTranscript(data.transcript, debug)
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMessage)
          console.error('Transcription error:', err)
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

  const value: VoiceContextType = {
    isRecording,
    transcript,
    isProcessing,
    error,
    start,
    stop,
  }

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoice() {
  const context = useContext(VoiceContext)
  
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider')
  }
  
  return context
} 