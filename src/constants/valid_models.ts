/**
 * List of valid models that can be used in the application.
 */
export const VALID_MODELS = [
  {
    model: 'gemini-2.0-flash',
    name: 'gemini_2.0_flash',
    display: 'Gemini 2.0 Flash',
  },
  {
    model: 'gemini-2.0-flash-lite-preview-02-05',
    name: 'gemini-2.0_flash_lite_preview_02_05',
    display: 'Gemini 2.0 Flash Lite',
  },
]

/**
 * Type of valid models that can be used in the application.
 */
export type ValidModel =
  | 'gemini_2.0_flash'
  | 'gemini-2.0_flash_lite_preview_02_05'
