"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X } from "lucide-react"
import { SvgRenderer } from "./svg-renderer"
import type { SvgData, ColorData } from "./types"

interface ColorEditorProps {
  svg: SvgData
  showBorders: boolean
  setShowBorders: (show: boolean) => void
  onColorSelect?: (pathId: string, color: ColorData) => void
}

export function ColorEditor({ svg, showBorders, setShowBorders, onColorSelect }: ColorEditorProps) {
  const [selectedColors, setSelectedColors] = useState<ColorData[]>([])
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)
  const [pathColors, setPathColors] = useState<Record<string, string>>({})

//  pathSelect here======================>
 const handlePathSelect = useCallback((pathId: string) => {
  const selectedPath = svg.paths.find((p) => p.id === pathId);
  if (!selectedPath) return;

  const selectedFillColor = selectedPath.fill || "red"; // Default to "red" if no fill color

  // Find all paths with the same color
  const matchingPaths = svg.paths
    .filter((p) => p.fill === selectedFillColor)
    .map((p) => p.id);

  setSelectedPathId((prevSelected) =>
    prevSelected === pathId ? null : pathId
  );

  setPathColors((prev) => {
    const updatedColors = { ...prev };
    matchingPaths.forEach((id) => {
      updatedColors[id] = updatedColors[id] || selectedFillColor;
    });
    return updatedColors;
  });
}, [svg.paths]);




  const handleSave = () => {
    console.log("Saved Path Colors:", pathColors)
    console.log("SVG Data:", svg)
  }

  const handleColorSelect = useCallback(
    (color: string) => {
      if (!selectedPathId) return

      const newColor: ColorData = {
        id: `${selectedPathId}-${color}`,
        color,
        name: `Color ${color}`,
      }

      setPathColors((prev) => ({
        ...prev,
        [selectedPathId]: color,
      }))

      if (!selectedColors.some((c) => c.color === color)) {
        setSelectedColors((prev) => [...prev, newColor])
      }

      if (onColorSelect) {
        onColorSelect(selectedPathId, newColor)
      }
    },
    [selectedPathId, onColorSelect, selectedColors],
  )

  const handleRemoveColor = useCallback(
    (colorToRemove: string) => {
      const updatedPathColors = { ...pathColors }

      Object.keys(updatedPathColors).forEach((pathId) => {
        if (updatedPathColors[pathId] === colorToRemove) {
          delete updatedPathColors[pathId]
        }
      })

      setPathColors(updatedPathColors)
      setSelectedColors((prev) => prev.filter((c) => c.color !== colorToRemove))
    },
    [pathColors],
  )

  const selectedPath = selectedPathId ? svg.paths.find((p) => p.id === selectedPathId) : null
  const selectedPathColor = selectedPathId ? pathColors[selectedPathId] : null

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* SVG Preview (Click to select a path) */}
        <div className="border border-gray-200 rounded-md overflow-hidden flex justify-center items-center p-4">
          <SvgRenderer
            svg={svg}
            selectedPathId={selectedPathId}
            pathColors={pathColors}
            onPathSelect={handlePathSelect} // Allows path selection
          />
        </div>

        {/* Show all SVG colors (Click to apply to selected path) */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">ALL SVG COLORS:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set([
                ...Object.values(pathColors),
                ...svg.paths.map((p) => p.fill).filter((color): color is string => Boolean(color)) // Ensures only strings are in Set
              ])
            ).map((color, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded border border-gray-200 cursor-pointer transition-transform 
        hover:scale-110 ${selectedPathColor === color ? "ring-2 ring-black" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (selectedPathId && color !== undefined) {
                    handleColorSelect(color);
                  }
                }}
              />
            ))}
          </div>
        </div>



        {/* Selected Path Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">SELECTED PATH:</h3>
          <div className="p-2 bg-gray-100 rounded">
            {selectedPath ? (
              <div className="flex items-center justify-between">
                <span>{selectedPath.id}</span>
                <div
                  className="w-6 h-6 rounded-sm border border-gray-300"
                  style={{ backgroundColor: pathColors[selectedPath.id] || selectedPath.fill || "red" }}
                />
              </div>
            ) : (
              <span className="text-gray-500">Click on a path to select it</span>
            )}
          </div>
        </div>

        {/* Border Controls */}
        <div className="space-y-2">
          <Button
            variant={showBorders ? "default" : "outline"}
            className="w-full"
            onClick={() => setShowBorders(!showBorders)}
          >
            {showBorders ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Remove Borders
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Borders
              </>
            )}
          </Button>
        </div>

        {/* Selected Colors */}
        {/* Display all fill colors */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">COLORS USED:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(pathColors).map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer relative group"
                style={{ backgroundColor: color }}
                onClick={() => handleRemoveColor(color)}
                title="Click to remove"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                  <X className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Color Palette */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Select Color:</h3>
          <div className="grid grid-cols-8 gap-1">
            {colorPalette.map((color, index) => (
              <button
                key={index}
                className={`w-6 h-6 rounded-sm border transition-transform hover:scale-110 ${selectedPathColor === color ? "border-black ring-2 ring-black/20" : "border-gray-200"
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                disabled={!selectedPathId}
              />
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </div>
    </ScrollArea>
  )
}

const colorPalette = [
  "#f5f5f0", "#e6e6d8", "#d8d8c0", "#ccccb3", "#bfbfa8", "#b3b39e", "#a6a693", "#999989",
  "#8c8c7f", "#000000", "#595959", "#404040", "#262626", "#666666", "#808080", "#999999",
  "#d9e6f2", "#c6d9e6", "#b3ccd9", "#a0bfcc", "#8cb3bf", "#79a6b3", "#6699a6", "#538099",
  "#d9e6d9", "#c6d9c6", "#b3ccb3", "#a0bfa0", "#8cb38c", "#79a679", "#669966", "#538053",
  "#f2d9d9", "#e6c6c6", "#d9b3b3", "#cca0a0", "#bf8c8c", "#b37979", "#a66666", "#995353",
  "#f2e6d9", "#e6d9c6", "#d9ccb3", "#ccbfa0", "#bfb38c", "#b3a679", "#a69966", "#998c53",
  "#ff5733", "#33ff57", "#3357ff", "#ff33a1", "#a133ff", "#33ffa1", "#ffeb33", "#ff3362"
]
