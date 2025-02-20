import React, { useEffect, useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createRoot } from 'react-dom/client'
import { useChromeStorage } from './hooks/useChromeStorage'
import { SYSTEM_PROMPT } from './constants/prompt'

// Custom debounce hook with proper browser typing
const useDebounce = (callback: Function, delay: number) => {
  const [timer, setTimer] = useState<number | undefined>(undefined)

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timer) {
        window.clearTimeout(timer)
      }

      const newTimer = window.setTimeout(() => {
        callback(...args)
      }, delay)

      setTimer(newTimer)
    },
    [callback, delay, timer]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [timer])

  return debouncedCallback
}

interface ActiveElement {
  element: HTMLTextAreaElement
  lastValue: string
  position: number
}

const TextAreaMonitor: React.FC = () => {
  const [activeTextArea, setActiveTextArea] = useState<ActiveElement | null>(
    null
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const getAICompletion = async (context: string) => {
    // Fetch Model and Key from Chrome Local Storage
    const { selectModel, getKeyModel } = useChromeStorage()
    const apiKey = (await getKeyModel(await selectModel())).apiKey

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Generate completion
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          parts: [{ text: context }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    })

    const completion = result.response.text()

    return completion
  }

  const handleAutoComplete = async (text: string, position: number) => {
    if (!activeTextArea || isProcessing) return

    try {
      setIsProcessing(true)
      // Get the text before the cursor
      const beforeCursor = text.slice(0, position)

      // Call your AI Completion
      const completion = await getAICompletion(beforeCursor)
      console.log(completion)
    } catch (error) {
      console.error('Error getting completion:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Debounce the handleAutoComplete function
  const debouncedAutoComplete = useDebounce(handleAutoComplete, 1000)

  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLTextAreaElement
    if (target.tagName.toLowerCase() === 'textarea') {
      setActiveTextArea({
        element: target,
        lastValue: target.value,
        position: target.selectionStart || 0,
      })
    }
  }

  const handleBlur = () => {
    setActiveTextArea(null)
  }

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    if (activeTextArea && target === activeTextArea.element) {
      const newValue = target.value
      const cursorPosition = target.selectionStart || 0

      // Use the debounced version instead of direct call
      debouncedAutoComplete(newValue, cursorPosition)

      setActiveTextArea({
        ...activeTextArea,
        lastValue: newValue,
        position: cursorPosition,
      })
    }
  }

  useEffect(() => {
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)
    document.addEventListener('input', handleInput)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
      document.removeEventListener('input', handleInput)
    }
  }, [activeTextArea])

  return null
}

// Create and mount the monitoring component
const root = document.createElement('div')
root.id = '__otto_complete_container'
document.body.append(root)

createRoot(root).render(
  <React.StrictMode>
    <TextAreaMonitor />
  </React.StrictMode>
)
