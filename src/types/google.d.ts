declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: string | number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              locale?: string;
            },
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: any) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (hint: string, callback: (response: any) => void) => void;
        };
      };
    };
  }
}

export {};
