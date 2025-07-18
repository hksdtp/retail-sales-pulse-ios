/**
 * Dark Mode Text Enhancer
 * Forces high contrast text in dark mode for better visibility
 */

export class DarkModeEnhancer {
  private observer: MutationObserver | null = null;
  private isEnabled = false;

  /**
   * Initialize the dark mode enhancer
   */
  public init(): void {
    this.isEnabled = true;
    this.enhanceExistingElements();
    this.startObserving();
    this.addGlobalStyles();
  }

  /**
   * Disable the dark mode enhancer
   */
  public disable(): void {
    this.isEnabled = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Check if dark mode is currently active
   */
  private isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Enhance existing elements on the page
   */
  private enhanceExistingElements(): void {
    if (!this.isDarkMode()) return;

    // Force white text for all text elements
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label, a, li, td, th, button');
    textElements.forEach(element => {
      this.enhanceElement(element as HTMLElement);
    });

    // Force white text for input placeholders
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      this.enhanceInput(input as HTMLInputElement);
    });
  }

  /**
   * Enhance a single element
   */
  private enhanceElement(element: HTMLElement): void {
    if (!this.isDarkMode() || !element) return;

    // Skip if element already has enhanced styling
    if (element.dataset.darkEnhanced === 'true') return;

    // Apply high contrast styling
    const computedStyle = window.getComputedStyle(element);
    const currentColor = computedStyle.color;

    // Only enhance if text is not already white/light
    if (!this.isLightColor(currentColor)) {
      element.style.color = 'white';
      element.style.fontWeight = this.getEnhancedFontWeight(computedStyle.fontWeight);
      element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
      element.dataset.darkEnhanced = 'true';
    }
  }

  /**
   * Enhance input elements
   */
  private enhanceInput(input: HTMLInputElement): void {
    if (!this.isDarkMode() || !input) return;

    input.style.color = 'white';
    input.style.backgroundColor = 'hsl(240 5.9% 15%)';
    input.style.border = '2px solid hsl(240 3.7% 30%)';
    input.style.fontWeight = '500';

    // Enhance placeholder
    const placeholder = input.getAttribute('placeholder');
    if (placeholder) {
      input.style.setProperty('--placeholder-color', 'hsl(0 0% 70%)');
    }
  }

  /**
   * Check if a color is light (white-ish)
   */
  private isLightColor(color: string): boolean {
    // Convert color to RGB values
    const rgb = this.parseColor(color);
    if (!rgb) return false;

    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.7; // Consider light if luminance > 70%
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): { r: number; g: number; b: number } | null {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  /**
   * Get enhanced font weight
   */
  private getEnhancedFontWeight(currentWeight: string): string {
    const weight = parseInt(currentWeight) || 400;
    
    if (weight < 400) return '450';
    if (weight < 500) return '500';
    if (weight < 600) return '600';
    return currentWeight;
  }

  /**
   * Start observing DOM changes
   */
  private startObserving(): void {
    if (!this.isEnabled) return;

    this.observer = new MutationObserver((mutations) => {
      if (!this.isDarkMode()) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            this.enhanceElement(element);

            // Enhance child elements
            const children = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label, a, li, td, th, button, input, textarea');
            children.forEach(child => {
              if (child instanceof HTMLInputElement || child instanceof HTMLTextAreaElement) {
                this.enhanceInput(child);
              } else {
                this.enhanceElement(child as HTMLElement);
              }
            });
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Add global CSS styles for better dark mode
   */
  private addGlobalStyles(): void {
    const styleId = 'dark-mode-enhancer-styles';
    
    // Remove existing styles
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new styles
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .dark * {
        color: white !important;
      }
      
      .dark input::placeholder,
      .dark textarea::placeholder {
        color: hsl(0 0% 70%) !important;
      }
      
      .dark input,
      .dark textarea,
      .dark select {
        color: white !important;
        background-color: hsl(240 5.9% 15%) !important;
        border-color: hsl(240 3.7% 30%) !important;
      }
      
      .dark .bg-white,
      .dark .bg-gray-50,
      .dark .bg-gray-100 {
        background-color: hsl(240 5.9% 12%) !important;
        color: white !important;
        border: 1px solid hsl(240 3.7% 25%) !important;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Create global instance
export const darkModeEnhancer = new DarkModeEnhancer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    darkModeEnhancer.init();
  });
} else {
  darkModeEnhancer.init();
}

// Re-enhance when theme changes
document.addEventListener('themechange', () => {
  setTimeout(() => {
    darkModeEnhancer.init();
  }, 100);
});

export default darkModeEnhancer;
