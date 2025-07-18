import React, { useState } from 'react';
import { AnimatedButton, FloatingActionButton, IconButton, ActionButton } from '@/components/ui/animated-button';
import { AnimatedModal, useAnimatedModal } from '@/components/ui/animated-dialog';
import { useTheme } from '@/context/ThemeContext';
import { 
  Moon, 
  Sun, 
  Plus, 
  Settings, 
  Heart, 
  Star, 
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ThemeAnimationDemo: React.FC = () => {
  const { theme, toggleTheme, actualTheme } = useTheme();
  const { isOpen, openModal, closeModal } = useAnimatedModal();
  const [cardStates, setCardStates] = useState({
    card1: false,
    card2: false,
    card3: false
  });

  const handleCardHover = (cardId: string, isHovered: boolean) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: isHovered
    }));
  };

  const handleActionSuccess = () => {
    console.log('Action completed successfully!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dark Mode & Animation Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Showcase of optimized dark theme and smooth animations
          </p>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">Current theme: {actualTheme}</span>
            <AnimatedButton
              onClick={toggleTheme}
              variant="outline"
              className="gap-2"
              hoverLift={true}
            >
              {actualTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Toggle Theme
            </AnimatedButton>
          </div>
        </div>

        {/* Button Showcase */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Animated Buttons</CardTitle>
            <CardDescription>
              Various button styles with hover effects, ripples, and loading states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Animated Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <AnimatedButton variant="default" hoverLift={true}>
                  Primary Button
                </AnimatedButton>
                <AnimatedButton variant="secondary" hoverLift={true}>
                  Secondary Button
                </AnimatedButton>
                <AnimatedButton variant="outline" hoverLift={true}>
                  Outline Button
                </AnimatedButton>
                <AnimatedButton variant="ghost" hoverLift={true}>
                  Ghost Button
                </AnimatedButton>
                <AnimatedButton variant="destructive" hoverLift={true}>
                  Destructive Button
                </AnimatedButton>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <IconButton icon={<Heart />} aria-label="Like" />
                <IconButton icon={<Star />} aria-label="Favorite" size="lg" />
                <IconButton icon={<Settings />} aria-label="Settings" variant="outline" />
                <IconButton icon={<Edit />} aria-label="Edit" variant="secondary" />
                <IconButton icon={<Trash2 />} aria-label="Delete" variant="destructive" />
              </div>
            </div>

            {/* Action Buttons with States */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Action Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <ActionButton
                  onSuccess={handleActionSuccess}
                  onClick={() => new Promise(resolve => setTimeout(resolve, 2000))}
                  icon={<Download className="h-4 w-4" />}
                >
                  Download File
                </ActionButton>
                <ActionButton
                  onSuccess={handleActionSuccess}
                  onClick={() => new Promise(resolve => setTimeout(resolve, 1500))}
                  icon={<Upload className="h-4 w-4" />}
                  successIcon={<Save className="h-4 w-4" />}
                  successText="Uploaded!"
                >
                  Upload File
                </ActionButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Demo */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Animated Modals</CardTitle>
            <CardDescription>
              Smooth modal animations with backdrop blur and scale effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedButton onClick={openModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Open Modal
            </AnimatedButton>
          </CardContent>
        </Card>

        {/* Card Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => (
            <Card
              key={num}
              className="card-hover cursor-pointer"
              onMouseEnter={() => handleCardHover(`card${num}`, true)}
              onMouseLeave={() => handleCardHover(`card${num}`, false)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${
                    num === 1 ? 'from-blue-500 to-cyan-500' :
                    num === 2 ? 'from-purple-500 to-pink-500' :
                    'from-green-500 to-emerald-500'
                  }`}>
                    {num === 1 ? <Eye className="h-4 w-4 text-white" /> :
                     num === 2 ? <Star className="h-4 w-4 text-white" /> :
                     <Heart className="h-4 w-4 text-white" />}
                  </div>
                  Card {num}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card demonstrates hover animations and smooth transitions.
                  {cardStates[`card${num}` as keyof typeof cardStates] && " Currently hovered!"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form Elements Demo */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Form inputs with focus animations and improved dark mode styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-field">
              <label className="block text-sm font-medium mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter some text..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
            <div className="form-field">
              <label className="block text-sm font-medium mb-2">
                Textarea
              </label>
              <textarea
                placeholder="Enter a longer text..."
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={() => console.log('FAB clicked!')}
          position="bottom-right"
        >
          <Plus className="h-6 w-6" />
        </FloatingActionButton>
      </div>

      {/* Demo Modal */}
      <AnimatedModal isOpen={isOpen} onClose={closeModal} size="md">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Demo Modal</h2>
          <p className="text-muted-foreground">
            This modal demonstrates smooth animations with backdrop blur and scale effects.
            The modal respects the current theme and provides excellent user experience.
          </p>
          <div className="flex gap-4 pt-4">
            <AnimatedButton onClick={closeModal} variant="outline">
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={closeModal}>
              Confirm
            </AnimatedButton>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default ThemeAnimationDemo;
