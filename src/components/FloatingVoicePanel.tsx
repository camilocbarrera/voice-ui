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
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 sm:max-w-[28rem]">
      <Card className="w-full shadow-lg border touch-manipulation">
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header with Mic Control and Collapse */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={handleMicClick}
              disabled={isProcessing}
              size="sm"
              variant={isRecording ? "destructive" : isProcessing ? "secondary" : "default"}
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0 transition-all duration-300 flex-shrink-0",
                isRecording && "sonar-animation animate-pulse"
              )}
            >
              {getIcon()}
            </Button>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium truncate">{getStatusText()}</div>
              {error && (
                <div className="text-xs text-destructive mt-1 truncate">{error}</div>
              )}
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
              className="w-6 h-6 sm:w-8 sm:h-8 p-0 flex-shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
          </div>

          {/* Voice Command Logs - Collapsible */}
          {isExpanded && (
            <div className="border-t pt-2 sm:pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Recent Commands & Debug
                </div>
                <Button
                  onClick={() => setShowDebugDetails(!showDebugDetails)}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                >
                  {showDebugDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              <ScrollArea className="h-40 sm:h-64">
                {entries.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No commands yet
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="text-xs space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-muted-foreground text-xs truncate">
                            {formatTime(entry.timestamp)}
                          </span>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge 
                              variant={entry.processingType === 'ai' ? 'default' : 'secondary'}
                              className="h-3 sm:h-4 text-xs px-1 sm:px-2"
                            >
                              {entry.processingType === 'ai' ? 'AI' : 'Static'}
                            </Badge>
                            <Badge 
                              variant={entry.status === 'success' ? 'default' : 'destructive'}
                              className="h-3 sm:h-4 text-xs px-1 sm:px-2"
                            >
                              {entry.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded p-2 space-y-1 sm:space-y-2">
                          <div className="font-mono text-foreground text-xs break-words">
                            "{entry.command}"
                          </div>
                          {entry.result && (
                            <div className="text-muted-foreground border-l-2 border-muted pl-2 text-xs break-words">
                              {entry.result}
                            </div>
                          )}
                          
                          {showDebugDetails && entry.aiPlan && (
                            <div className="mt-1 sm:mt-2 p-2 bg-muted/30 rounded text-xs space-y-1 sm:space-y-2">
                              <div className="font-medium text-foreground">
                                AI Plan (Confidence: {Math.round(entry.aiPlan.confidence * 100)}%)
                              </div>
                              <div className="text-muted-foreground text-xs break-words">
                                {entry.aiPlan.reasoning}
                              </div>
                              <div className="space-y-1">
                                {entry.aiPlan.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-foreground font-mono text-xs flex-shrink-0">
                                      {idx + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono text-xs break-words">
                                        {step.type}({step.target})
                                      </div>
                                      {step.value && (
                                        <div className="text-muted-foreground text-xs break-words">
                                          Value: "{step.value}"
                                        </div>
                                      )}
                                      <div className="text-muted-foreground text-xs break-words">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
} 