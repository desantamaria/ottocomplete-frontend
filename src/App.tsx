import React, { useState } from 'react'

import Show from '@/components/Show'
import { Button } from '@/components/ui/button'
import { HideApiKey } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VALID_MODELS, type ValidModel } from './constants/valid_models'
import { useChromeStorage } from './hooks/useChromeStorage'

const Popup: React.FC = () => {
  const [apikey, setApikey] = React.useState<string | null>(null)
  const [model, setModel] = React.useState<ValidModel | null>(null)
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

  const [isloading, setIsloading] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<{
    state: 'error' | 'success'
    message: string
  } | null>(null)

  const [selectedModel, setSelectedModel] = useState<ValidModel>()

  const updateStorage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsloading(true)

      const { setKeyModel } = useChromeStorage()
      if (apikey && model) {
        await setKeyModel(apikey, model)
      }

      setSubmitMessage({
        state: 'success',
        message: 'API Key saved successfully',
      })
    } catch (error: any) {
      setSubmitMessage({
        state: 'error',
        message: error.message,
      })
    } finally {
      setIsloading(false)
    }
  }

  React.useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return

      const { selectModel, getKeyModel } = useChromeStorage()

      setModel(await selectModel())
      setSelectedModel(await selectModel())
      setApikey((await getKeyModel(await selectModel())).apiKey)

      setIsLoaded(true)
    }

    loadChromeStorage()
  }, [])

  const handleModel = async (v: ValidModel) => {
    if (v) {
      const { setSelectModel, getKeyModel, selectModel } = useChromeStorage()
      setSelectModel(v)
      setModel(v)
      setSelectedModel(v)
      setApikey((await getKeyModel(await selectModel())).apiKey)
    }
  }

  return (
    <div className="relative p-4 w-[350px] bg-background">
      <Show show={isLoaded}>
        <div className="">
          <div className="text-center">
            <h1 className=" font-bold text-3xl text-white">
              Otto <span className="text-whisperOrange">Complete</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Autocompletion Companion
            </p>
          </div>
          <form
            onSubmit={(e) => updateStorage(e)}
            className="mt-10 flex flex-col gap-2 w-full"
          >
            <div className="space-y-2">
              <label htmlFor="text" className="text-xs text-muted-foreground">
                Select a model
              </label>
              <Select
                onValueChange={(v: ValidModel) => handleModel(v)}
                value={selectedModel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {VALID_MODELS.map((modelOption) => (
                      <SelectItem
                        key={modelOption.name}
                        value={modelOption.name}
                      >
                        {modelOption.display}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="text" className="text-xs text-muted-foreground">
                API Key {model ? `for ${model}` : ''}
              </label>
              <HideApiKey
                value={apikey || ''}
                onChange={(e) => setApikey(e.target.value)}
                placeholder="Enter OpenAI API Key"
                disabled={!model}
                required
              />
            </div>
            <Button disabled={isloading} type="submit" className="w-full mt-2">
              Save API Key
            </Button>
          </form>
          {submitMessage ? (
            <div
              className="mt-2 text-center text-sm text-muted-foreground flex items-center justify-center p-2 rounded-sm"
              style={{
                color: submitMessage.state === 'error' ? 'red' : 'green',
                border:
                  submitMessage.state === 'error'
                    ? '1px solid red'
                    : '1px solid green',
                backgroundColor:
                  submitMessage.state === 'error'
                    ? 'rgba(255, 0, 0, 0.1)'
                    : 'rgba(0, 255, 0, 0.1)',
              }}
            >
              {submitMessage.state === 'error' ? (
                <p className="text-red-500">{submitMessage.message}</p>
              ) : (
                <p className="text-green-500">{submitMessage.message}</p>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </Show>
    </div>
  )
}

export default Popup
