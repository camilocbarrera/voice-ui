'use client'

import { VoiceTestComponents } from '../components/VoiceTestComponents'
import { FloatingVoicePanel } from '../components/FloatingVoicePanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <header className="text-center mb-12 space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            VoiceUI
          </h1>
          
          <div className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of user interfaces with AI-powered voice commands. 
            Try natural language like{' '}
            <Badge variant="secondary" className="mx-1">send a message that says Hey there...</Badge>,{' '}
            <Badge variant="secondary" className="mx-1">give it 1 star and leave bad feedback</Badge>, or{' '}
            <Badge variant="secondary" className="mx-1">toggle notifications and play music</Badge>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Voice Commands</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Actions</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
          <div className="xl:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Interactive Components</CardTitle>
                <CardDescription>
                  Try controlling these components with your voice using the floating panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceTestComponents />
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Built with Next.js, Tailwind CSS, and shadcn/ui</span>
            <Badge variant="outline" className="text-xs">
              Voice-Enabled
            </Badge>
          </div>
        </footer>
      </div>
      
      <FloatingVoicePanel />
    </div>
  )
}
