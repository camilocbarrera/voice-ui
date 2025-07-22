export interface DOMElement {
  id?: string
  className?: string
  tagName: string
  textContent?: string
  type?: string
  placeholder?: string
  value?: string
  href?: string
  role?: string
  ariaLabel?: string
  dataVoice?: string
  dataVoiceIntents?: string
  dataVoiceAction?: string
  path: string
}

export interface ActionStep {
  type: 'click' | 'type' | 'select' | 'focus' | 'scroll' | 'wait' | 'custom'
  target: string
  value?: string
  description: string
}

export interface AIActionPlan {
  steps: ActionStep[]
  confidence: number
  reasoning: string
}

export function getDOMContext(): DOMElement[] {
  const elements: DOMElement[] = []
  
  const interactiveElements = document.querySelectorAll(`
    button, input, textarea, select, a, 
    [role="button"], [tabindex], 
    [data-voice], [contenteditable],
    .clickable, .interactive
  `)
  
  interactiveElements.forEach((element, index) => {
    if (element instanceof HTMLElement) {
      const rect = element.getBoundingClientRect()
      
      if (rect.width > 0 && rect.height > 0 && 
          rect.top >= 0 && rect.left >= 0 && 
          rect.bottom <= window.innerHeight && 
          rect.right <= window.innerWidth) {
        
        const path = generateElementPath(element)
        
        elements.push({
          id: element.id || undefined,
          className: element.className || undefined,
          tagName: element.tagName.toLowerCase(),
          textContent: element.textContent?.trim().slice(0, 100) || undefined,
          type: (element as HTMLInputElement).type || undefined,
          placeholder: (element as HTMLInputElement).placeholder || undefined,
          value: (element as HTMLInputElement).value || undefined,
          href: (element as HTMLAnchorElement).href || undefined,
          role: element.getAttribute('role') || undefined,
          ariaLabel: element.getAttribute('aria-label') || undefined,
          dataVoice: element.getAttribute('data-voice') || undefined,
          dataVoiceIntents: element.getAttribute('data-voice-intents') || undefined,
          dataVoiceAction: element.getAttribute('data-voice-action') || undefined,
          path
        })
      }
    }
  })
  
  return elements
}

function generateElementPath(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`
  }

  const dataVoice = element.getAttribute('data-voice')
  if (dataVoice) {
    return `[data-voice="${dataVoice}"]`
  }

  const path = []
  let current = element
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()
    
    if (current.id) {
      selector += `#${current.id}`
      path.unshift(selector)
      break
    }
    
    if (current.className) {
      const safeClasses = current.className.trim().split(/\s+/)
        .filter(cls => /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cls) && !cls.includes(':'))
        .slice(0, 1)
      
      if (safeClasses.length > 0) {
        selector += `.${safeClasses[0]}`
      }
    }
    
    const siblings = Array.from(current.parentElement?.children || [])
      .filter(s => s.tagName === current.tagName)
    
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1
      selector += `:nth-child(${index})`
    }
    
    path.unshift(selector)
    current = current.parentElement as HTMLElement
    
    if (path.length >= 3) break
  }
  
  return path.join(' ')
}

export async function generateActionPlan(userQuery: string, domContext: DOMElement[]): Promise<AIActionPlan> {
  try {
    const response = await fetch('/api/ai-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuery,
        domContext
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate action plan')
    }

    const result = await response.json()
    return result as AIActionPlan
  } catch (error) {
    console.error('Error generating action plan:', error)
    return {
      steps: [],
      confidence: 0,
      reasoning: 'Failed to generate action plan due to API error'
    }
  }
}

export async function executeActionPlan(plan: AIActionPlan, onStepComplete?: (step: ActionStep, success: boolean) => void): Promise<boolean> {
  let allSuccess = true
  
  for (const step of plan.steps) {
    let success = false
    
    try {
      const element = document.querySelector(step.target)
      
      if (!element || !(element instanceof HTMLElement)) {
        console.error(`Element not found: ${step.target}`)
        success = false
      } else {
        success = await executeStep(element, step)
      }
    } catch (error) {
      console.error(`Error executing step:`, error)
      success = false
    }
    
    onStepComplete?.(step, success)
    
    if (!success) {
      allSuccess = false
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return allSuccess
}

async function executeStep(element: HTMLElement, step: ActionStep): Promise<boolean> {
  switch (step.type) {
    case 'click':
      element.click()
      return true
      
    case 'type':
      if ((element as HTMLInputElement).type !== undefined || 
          element.tagName === 'TEXTAREA' || 
          element.contentEditable === 'true') {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          (element as HTMLInputElement).value = step.value || ''
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
        } else {
          element.textContent = step.value || ''
        }
        return true
      }
      return false
      
    case 'select':
      if (element.tagName === 'SELECT') {
        (element as HTMLSelectElement).value = step.value || ''
        element.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
      
    case 'focus':
      element.focus()
      return true
      
    case 'scroll':
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return true
      
    case 'wait':
      await new Promise(resolve => setTimeout(resolve, parseInt(step.value || '1000')))
      return true
      
    case 'custom':
      console.log('Custom action:', step.description)
      return true
      
    default:
      return false
  }
} 