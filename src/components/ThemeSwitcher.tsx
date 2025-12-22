"use client";

import { useState } from 'react';
import { useTheme, ColorTheme, CardLayout, GraphDesign } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Palette, Layout, PieChart, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
  const { themeConfig, setColorTheme, setCardLayout, setGraphDesign, setBackgroundImageUrl } = useTheme();
  const { t } = useTranslation();
  const [bgUrlInput, setBgUrlInput] = useState(themeConfig.backgroundImageUrl || '');

  const colorThemes: { value: ColorTheme; label: string; colors: string }[] = [
    { value: 'default', label: 'Default', colors: 'from-blue-500 to-purple-500' },
    { value: 'ocean', label: 'Ocean', colors: 'from-cyan-500 to-blue-600' },
    { value: 'sunset', label: 'Sunset', colors: 'from-orange-500 to-pink-500' },
    { value: 'forest', label: 'Forest', colors: 'from-green-500 to-emerald-600' },
    { value: 'midnight', label: 'Midnight', colors: 'from-indigo-600 to-purple-700' },
    { value: 'rose', label: 'Rose', colors: 'from-pink-500 to-rose-600' },
  ];

  const cardLayouts: { value: CardLayout; label: string; description: string }[] = [
    { value: 'classic', label: 'Classic', description: 'Traditional card design' },
    { value: 'modern', label: 'Modern', description: 'Icon left, horizontal' },
    { value: 'minimal', label: 'Minimal', description: 'Borderless, clean' },
    { value: 'detailed', label: 'Detailed', description: 'Icon top, centered' },
  ];

  const graphDesigns: { value: GraphDesign; label: string; description: string }[] = [
    { value: 'circle', label: 'Circle', description: 'Circular progress' },
    { value: 'progress', label: 'Progress Bar', description: 'Linear progress' },
    { value: 'bar', label: 'Bar Chart', description: 'Vertical bars' },
    { value: 'minimal', label: 'Minimal', description: 'Simple text' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Theme settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[85vh] overflow-y-auto p-4" align="end" sideOffset={8}>
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 sticky -top-4 bg-popover pb-2 z-10 -mx-4 px-4 pt-4">
              <Palette className="h-4 w-4" />
              Color Theme
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setColorTheme(theme.value)}
                  className={`relative rounded-lg p-2 text-left transition-all ${
                    themeConfig.colorTheme === theme.value
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className={`h-6 w-full rounded-md bg-gradient-to-r ${theme.colors} mb-1.5`} />
                  <span className="text-[10px] font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Card Layout
            </h4>
            <div className="flex flex-col gap-1.5">
              {cardLayouts.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setCardLayout(layout.value)}
                  className={`flex items-start gap-2 rounded-lg p-2 text-left transition-all ${
                    themeConfig.cardLayout === layout.value
                      ? 'bg-primary/10 border border-primary'
                      : 'border border-transparent hover:bg-accent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-xs">{layout.label}</div>
                    <div className="text-[10px] text-muted-foreground">{layout.description}</div>
                  </div>
                  {themeConfig.cardLayout === layout.value && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Graph Design
            </h4>
            <div className="flex flex-col gap-1.5">
              {graphDesigns.map((design) => (
                <button
                  key={design.value}
                  onClick={() => setGraphDesign(design.value)}
                  className={`flex items-start gap-2 rounded-lg p-2 text-left transition-all ${
                    themeConfig.graphDesign === design.value
                      ? 'bg-primary/10 border border-primary'
                      : 'border border-transparent hover:bg-accent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-xs">{design.label}</div>
                    <div className="text-[10px] text-muted-foreground">{design.description}</div>
                  </div>
                  {themeConfig.graphDesign === design.value && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Background Image
            </h4>
            <div className="flex flex-col gap-2">
              <Input
                type="url"
                placeholder="Enter image URL"
                value={bgUrlInput}
                onChange={(e) => setBgUrlInput(e.target.value)}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 text-xs h-8"
                  onClick={() => setBackgroundImageUrl(bgUrlInput)}
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8"
                  onClick={() => {
                    setBgUrlInput('');
                    setBackgroundImageUrl('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSwitcher;
