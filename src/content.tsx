import { GoogleGenerativeAI } from '@google/generative-ai'
import React, { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SYSTEM_PROMPT } from './constants/prompt'
import { useChromeStorage } from './hooks/useChromeStorage'

interface ActiveElement {
  element: HTMLTextAreaElement
  lastValue: string
  position: number
}

// Debounce hook
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

  useEffect(() => {
    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [timer])

  return debouncedCallback
}

const TextAreaMonitor: React.FC = () => {
  const [activeTextArea, setActiveTextArea] = useState<ActiveElement | null>(
    null
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('')

  // Generate Autocompletion with Gemini
  const getAICompletion = async (context: string) => {
    const { selectModel, getKeyModel } = useChromeStorage()
    const apiKey = (await getKeyModel(await selectModel())).apiKey

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'user', parts: [{ text: context }] },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    })

    return result.response.text()
  }

  const handleAutoComplete = async (text: string, position: number) => {
    if (!activeTextArea || isProcessing) return

    try {
      setIsProcessing(true)
      const beforeCursor = text.slice(0, position)

      // Clear current suggestion while processing
      setCurrentSuggestion('')

      // Get AI completion
      const completion = await getAICompletion(beforeCursor)
      console.log(completion)

      // Set the suggestion
      setCurrentSuggestion(completion)

      // TODO DISPLAY SUGGESTION ON DOM
    } catch (error) {
      console.error('Error getting completion:', error)
      setCurrentSuggestion('')
    } finally {
      setIsProcessing(false)
    }
  }

  const acceptSuggestion = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && currentSuggestion && activeTextArea) {
      event.preventDefault()

      const textarea = activeTextArea.element
      const cursorPosition = textarea.selectionStart || 0

      // Insert the suggestion at cursor position
      const newValue =
        textarea.value.slice(0, cursorPosition) +
        currentSuggestion +
        textarea.value.slice(cursorPosition)

      textarea.value = newValue

      // Move cursor to end of inserted suggestion
      const newCursorPosition = cursorPosition + currentSuggestion.length
      textarea.selectionStart = newCursorPosition
      textarea.selectionEnd = newCursorPosition

      // Clear the suggestion
      setCurrentSuggestion('')
    }
  }

  const debouncedAutoComplete = useDebounce(handleAutoComplete, 500)

  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLTextAreaElement
    if (target.tagName.toLowerCase() === 'textarea') {
      setActiveTextArea({
        element: target,
        lastValue: target.value,
        position: target.selectionStart || 0,
      })
    }
  }

  const handleFocusOut = () => {
    setActiveTextArea(null)
    setCurrentSuggestion('')
  }

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    if (activeTextArea && target === activeTextArea.element) {
      const newValue = target.value
      const cursorPosition = target.selectionStart || 0

      debouncedAutoComplete(newValue, cursorPosition)

      setActiveTextArea({
        ...activeTextArea,
        lastValue: newValue,
        position: cursorPosition,
      })
    }
  }

  // Add Event Listeners
  useEffect(() => {
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    document.addEventListener('input', handleInput)
    document.addEventListener('keydown', acceptSuggestion)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      document.removeEventListener('input', handleInput)
      document.removeEventListener('keydown', acceptSuggestion)
    }
  }, [activeTextArea, currentSuggestion])

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
