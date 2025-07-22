'use client'

import { VoiceTestComponents } from '../components/VoiceTestComponents'
import { FloatingVoicePanel } from '../components/FloatingVoicePanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Zap, Heart } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <header className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            VoiceUI
          </h1>
          
          <div className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Experience the future of user interfaces with AI-powered voice commands. 
            Try natural language like{' '}
            <Badge variant="secondary" className="mx-1 text-xs sm:text-sm">send a message that says Hey there...</Badge>,{' '}
            <Badge variant="secondary" className="mx-1 text-xs sm:text-sm">give it 1 star and leave bad feedback</Badge>, or{' '}
            <Badge variant="secondary" className="mx-1 text-xs sm:text-sm">toggle notifications and play music</Badge>
          </div>
          
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Voice Commands</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>AI-Powered Actions</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="xl:col-span-4">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl">Interactive Components</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Try controlling these components with your voice using the floating panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceTestComponents />
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="pt-6 sm:pt-8 border-t border-border">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">
                Made with 
              </span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                by <Link href="https://www.linkedin.com/company/letsacc" className="underline hover:text-primary transition-colors duration-200 cursor-pointer" target="_blank">ACC.</Link>
              </span>
            </div>
            
            <div className="flex gap-8">
              <Link href="https://github.com/camilocbarrera/voice-ui" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer" target="_blank">
                GitHub
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Voice-Enabled
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Next.js + AI
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      <FloatingVoicePanel />
    </div>
  )
}
