'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { useVoice } from '../hooks/useVoice'
import { cn } from '../lib/utils'

interface REPLEntry {
  id: string
  timestamp: Date
  command: string
  result: string
  status: 'success' | 'error' | 'pending'
  aiPlan?: {
    steps: Array<{
      type: string
      target: string
      value?: string
      description: string
    }>
    confidence: number
    reasoning: string
  }
  processingType?: 'ai' | 'static' | 'error'
}

export function FloatingVoicePanel() {
  const { isRecording, isProcessing, error, start, stop, lastActionPlan } = useVoice()
  const [entries, setEntries] = useState<REPLEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDebugDetails, setShowDebugDetails] = useState(true)

  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { command, result, status, processingType, aiPlan } = event.detail
      const newEntry: REPLEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        command,
        result,
        status: status || 'success',
        processingType: processingType || 'static',
        aiPlan: aiPlan || lastActionPlan
      }
      setEntries(prev => [newEntry, ...prev].slice(0, 10))
    }

    window.addEventListener('voice-command', handleVoiceCommand as EventListener)
    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as EventListener)
    }
  }, [lastActionPlan])

  const handleMicClick = () => {
    if (isRecording) {
      stop()
    } else if (!isProcessing) {
      start()
    }
  }

  const getStatusText = () => {
    if (error) return 'Error occurred'
    if (isRecording) return 'Listening...'
    if (isProcessing) return 'Processing...'
    return 'Click to start...'
  }

  const getIcon = () => {
    if (isProcessing) return <Loader2 className="w-4 h-4 animate-spin" />
    if (isRecording) return <MicOff className="w-4 h-4" />
    return <Mic className="w-4 h-4" />
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-[28rem] shadow-lg border">
        <CardContent className="p-4 space-y-3">
          {/* Microphone Control */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleMicClick}
              disabled={isProcessing}
              size="sm"
              variant={isRecording ? "destructive" : isProcessing ? "secondary" : "default"}
              className={cn(
                "w-10 h-10 rounded-full p-0 transition-all duration-300",
                isRecording && "sonar-animation animate-pulse"
              )}
            >
              {getIcon()}
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium">{getStatusText()}</div>
              {error && (
                <div className="text-xs text-destructive mt-1">{error}</div>
              )}
            </div>

          </div>

          {/* Voice Command Logs */}
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Recent Commands & Debug
            </div>
            <ScrollArea className="h-64">
              {entries.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No commands yet
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-muted-foreground">
                          {formatTime(entry.timestamp)}
                        </span>
                        <div className="flex gap-1">
                          <Badge 
                            variant={entry.processingType === 'ai' ? 'default' : 'secondary'}
                            className="h-4 text-xs"
                          >
                            {entry.processingType === 'ai' ? 'AI' : 'Static'}
                          </Badge>
                          <Badge 
                            variant={entry.status === 'success' ? 'default' : 'destructive'}
                            className="h-4 text-xs"
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 space-y-2">
                        <div className="font-mono text-foreground">
                          "{entry.command}"
                        </div>
                        {entry.result && (
                          <div className="text-muted-foreground border-l-2 border-muted pl-2">
                            {entry.result}
                          </div>
                        )}
                        
                        {showDebugDetails && entry.aiPlan && (
                          <div className="mt-2 p-2 bg-muted/30 rounded text-xs space-y-2">
                            <div className="font-medium text-foreground">
                              AI Plan (Confidence: {Math.round(entry.aiPlan.confidence * 100)}%)
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {entry.aiPlan.reasoning}
                            </div>
                            <div className="space-y-1">
                              {entry.aiPlan.steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-foreground font-mono text-xs">
                                    {idx + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-mono text-xs">
                                      {step.type}({step.target})
                                    </div>
                                    {step.value && (
                                      <div className="text-muted-foreground text-xs">
                                        Value: "{step.value}"
                                      </div>
                                    )}
                                    <div className="text-muted-foreground text-xs">
                                      {step.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 