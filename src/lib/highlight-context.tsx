'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HighlightContextType {
  highlightElement: (element: Element, duration?: number) => void
  isElementHighlighted: (element: Element) => boolean
}

interface HighlightProviderProps {
  children: ReactNode
  highlightColor?: string
  highlightDuration?: number
  highlightIntensity?: 'subtle' | 'medium' | 'strong'
}

interface HighlightOverlay {
  id: string
  element: Element
  rect: DOMRect
  timestamp: number
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined)

export function HighlightProvider({ 
  children, 
  highlightColor = '#3b82f6',
  highlightDuration = 2000,
  highlightIntensity = 'medium'
}: HighlightProviderProps) {
  const [highlightedElements, setHighlightedElements] = useState<HighlightOverlay[]>([])

  const highlightElement = useCallback((element: Element, duration = highlightDuration) => {
    const rect = element.getBoundingClientRect()
    const id = `highlight-${Date.now()}-${Math.random()}`
    
    const highlight: HighlightOverlay = {
      id,
      element,
      rect: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.x,
        y: rect.y,
        toJSON: rect.toJSON
      },
      timestamp: Date.now()
    }

    setHighlightedElements(prev => [...prev, highlight])

    setTimeout(() => {
      setHighlightedElements(prev => prev.filter(h => h.id !== id))
    }, duration)
  }, [highlightDuration])

  const isElementHighlighted = useCallback((element: Element) => {
    return highlightedElements.some(h => h.element === element)
  }, [highlightedElements])

  const getHighlightProps = () => {
    const intensityProps = {
      subtle: {
        borderWidth: '2px',
        opacity: 0.6,
        scale: 1.02
      },
      medium: {
        borderWidth: '3px',
        opacity: 0.8,
        scale: 1.05
      },
      strong: {
        borderWidth: '4px',
        opacity: 1,
        scale: 1.08
      }
    }
    
    return intensityProps[highlightIntensity]
  }

  const value: HighlightContextType = {
    highlightElement,
    isElementHighlighted
  }

  const highlightProps = getHighlightProps()

  return (
    <HighlightContext.Provider value={value}>
      {children}
      
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {highlightedElements.map((highlight) => (
            <motion.div
              key={highlight.id}
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                borderWidth: '0px'
              }}
              animate={{ 
                opacity: highlightProps.opacity,
                scale: highlightProps.scale,
                borderWidth: highlightProps.borderWidth
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                borderWidth: '0px'
              }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0.2
              }}
              style={{
                position: 'absolute',
                top: highlight.rect.top,
                left: highlight.rect.left,
                width: highlight.rect.width,
                height: highlight.rect.height,
                borderColor: highlightColor,
                borderStyle: 'solid',
                borderRadius: '8px',
                backgroundColor: `${highlightColor}15`,
                boxShadow: `0 0 20px ${highlightColor}40`,
                pointerEvents: 'none',
                transformOrigin: 'center'
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </HighlightContext.Provider>
  )
}

export function useHighlight() {
  const context = useContext(HighlightContext)
  
  if (context === undefined) {
    throw new Error('useHighlight must be used within a HighlightProvider')
  }
  
  return context
} 