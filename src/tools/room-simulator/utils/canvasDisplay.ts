export type CanvasDisplayOptions = {
  showFurnitureSizes: boolean
  showSpacingGuides: boolean
  showWarningIcons: boolean
  showFixedElementLabels: boolean
}

export function getDefaultCanvasDisplayOptions(): CanvasDisplayOptions {
  return {
    showFurnitureSizes: false,
    showSpacingGuides: false,
    showWarningIcons: true,
    showFixedElementLabels: true,
  }
}
