export type VoiceAction = 'click' | 'show' | 'hide' | 'toggle' | 'scroll' | 'select' | 'focus' | 'rate'

interface MatchResult {
  element: Element
  action: VoiceAction
  confidence: number
  matchedText: string
}

let highlightCallback: ((element: Element, duration?: number) => void) | null = null

export function setHighlightCallback(callback: (element: Element, duration?: number) => void) {
  highlightCallback = callback
}

function dispatchVoiceEvent(command: string, result: string, status: 'success' | 'error', processingType: 'static' = 'static') {
  window.dispatchEvent(new CustomEvent('voice-command', {
    detail: { command, result, status, processingType }
  }))
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findVoiceElements(transcript: string): MatchResult[] {
  const normalizedTranscript = normalizeText(transcript)
  const matches: MatchResult[] = []
  
  const elements = document.querySelectorAll('[data-voice]')
  
  elements.forEach((element) => {
    const voiceText = element.getAttribute('data-voice')
    const voiceIntents = element.getAttribute('data-voice-intents')
    const voiceAction = (element.getAttribute('data-voice-action') || 'click') as VoiceAction
    
    if (!voiceText) return
    
    const searchTexts = [voiceText]
    if (voiceIntents) {
      searchTexts.push(...voiceIntents.split(',').map(intent => intent.trim()))
    }
    
    for (const searchText of searchTexts) {
      const normalizedSearchText = normalizeText(searchText)
      
      if (normalizedTranscript.includes(normalizedSearchText)) {
        matches.push({
          element,
          action: voiceAction,
          confidence: normalizedSearchText.length / normalizedTranscript.length,
          matchedText: searchText,
        })
        break
      }
    }
  })
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}

export function executeAction(element: Element, action: VoiceAction): boolean {
  try {
    if (highlightCallback) {
      highlightCallback(element, action === 'scroll' ? 3000 : 2000)
    }

    switch (action) {
      case 'click':
        if (element instanceof HTMLElement) {
          element.click()
        }
        return true
        
      case 'show':
        if (element instanceof HTMLElement) {
          // First try to find and click a button that might show content
          const button = element.querySelector('button')
          if (button instanceof HTMLElement && element.classList.contains('hidden')) {
            button.click()
          } else {
            element.classList.remove('hidden')
            element.style.display = ''
          }
        }
        return true
        
      case 'hide':
        if (element instanceof HTMLElement) {
          // First try to find and click a button that might hide content
          const button = element.querySelector('button')
          if (button instanceof HTMLElement && !element.classList.contains('hidden')) {
            button.click()
          } else {
            element.classList.add('hidden')
          }
        }
        return true
        
      case 'toggle':
        if (element instanceof HTMLElement) {
          // First try to find and click a button inside the element
          const button = element.querySelector('button')
          if (button instanceof HTMLElement) {
            button.click()
          } else {
            // Fallback to DOM manipulation if no button found
            if (element.classList.contains('hidden') || element.style.display === 'none') {
              element.classList.remove('hidden')
              element.style.display = ''
            } else {
              element.classList.add('hidden')
            }
          }
        }
        return true

      case 'focus':
        if (element instanceof HTMLElement) {
          const input = element.querySelector('input, textarea, select')
          if (input instanceof HTMLElement) {
            input.focus()
          } else {
            element.focus()
          }
        }
        return true

      case 'select':
        if (element instanceof HTMLElement) {
          const select = element.querySelector('select')
          if (select instanceof HTMLSelectElement) {
            const firstOption = select.querySelector('option:not([value=""])')
            if (firstOption instanceof HTMLOptionElement) {
              select.value = firstOption.value
              select.dispatchEvent(new Event('change', { bubbles: true }))
            }
          }
        }
        return true

      case 'rate':
        if (element instanceof HTMLElement) {
          const buttons = element.querySelectorAll('button')
          if (buttons.length > 0) {
            buttons[buttons.length - 1].click()
          }
        }
        return true
        
      case 'scroll':
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        return true
        
      default:
        console.warn(`Unknown action: ${action}`)
        return false
    }
  } catch (error) {
    console.error('Error executing action:', error)
    return false
  }
}

export function processTranscript(transcript: string, debug = false): MatchResult | null {
  if (!transcript.trim()) return null
  
  const matches = findVoiceElements(transcript)
  
  if (debug) {
    console.log('Voice matches found:', matches)
  }
  
  if (matches.length === 0) {
    if (debug) {
      console.log('No voice elements matched for transcript:', transcript)
    }
    dispatchVoiceEvent(transcript, 'No matching elements found', 'error')
    return null
  }
  
  const bestMatch = matches[0]
  const success = executeAction(bestMatch.element, bestMatch.action)
  
  if (debug) {
    console.log(`Executed ${bestMatch.action} on element:`, bestMatch.element, 'Success:', success)
  }
  
  const result = success 
    ? `Executed ${bestMatch.action} on "${bestMatch.matchedText}"` 
    : `Failed to execute ${bestMatch.action}`
  
  dispatchVoiceEvent(transcript, result, success ? 'success' : 'error', 'static')
  
  return success ? bestMatch : null
} 