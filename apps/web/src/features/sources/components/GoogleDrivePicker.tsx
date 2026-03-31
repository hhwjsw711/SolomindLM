import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const GOOGLE_API_KEY_PATTERN = /^AIza[0-9A-Za-z_-]+$/;
const GOOGLE_CLIENT_ID_SUFFIX = '.apps.googleusercontent.com';

function hasValidGooglePickerConfig() {
  if (!GOOGLE_API_KEY || !GOOGLE_API_KEY_PATTERN.test(GOOGLE_API_KEY)) {
    console.error(
      'Google Drive picker misconfigured: expected VITE_GOOGLE_API_KEY to be a browser API key that starts with "AIza".',
      { apiKeyPresent: Boolean(GOOGLE_API_KEY) },
    );
    return false;
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_ID.endsWith(GOOGLE_CLIENT_ID_SUFFIX)) {
    console.error(
      'Google Drive picker misconfigured: expected VITE_GOOGLE_CLIENT_ID to be a Google OAuth web client ID.',
      { clientIdPresent: Boolean(GOOGLE_CLIENT_ID) },
    );
    return false;
  }

  return true;
}

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface GoogleDrivePickerHandle {
  open: () => void;
}

interface Props {
  onFilesSelected: (files: PickedFile[], accessToken: string) => void;
}

export const GoogleDrivePicker = forwardRef<GoogleDrivePickerHandle, Props>(
  ({ onFilesSelected }, ref) => {
    const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);
    const accessTokenRef = useRef<string | null>(null);
    const scriptsLoadedRef = useRef(false);
    const pickerLoadedRef = useRef(false);
    const gisLoadedRef = useRef(false);
    const pendingOpenRef = useRef(false);

    const openPicker = useCallback(
      (accessToken: string) => {
        if (!hasValidGooglePickerConfig()) return;

        if (typeof google === 'undefined' || !google.picker?.PickerBuilder) {
          pendingOpenRef.current = true;
          console.error('Google Drive picker is not ready yet. The Picker library has not finished loading.');
          return;
        }

        if (!accessToken.startsWith('ya29.')) {
          console.warn('Google Drive picker received an unexpected access token format.');
        }

        const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
          .setIncludeFolders(false)
          .setSelectFolderEnabled(false);

        const picker = new google.picker.PickerBuilder()
          .setOAuthToken(accessToken)
          .setDeveloperKey(GOOGLE_API_KEY!)
          .addView(view)
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setCallback((data: google.picker.ResponseObject) => {
            if (data.action === google.picker.Action.PICKED && data.docs) {
              const files: PickedFile[] = data.docs
                .filter((doc) => doc.name && doc.mimeType)
                .map((doc) => ({
                  id: doc.id,
                  name: doc.name!,
                  mimeType: doc.mimeType!,
                  sizeBytes: doc.sizeBytes,
                }));
              if (files.length > 0) {
                onFilesSelected(files, accessToken);
              }
            }
          })
          .build();

        picker.setVisible(true);
      },
      [onFilesSelected],
    );

    const flushPendingOpen = useCallback(() => {
      if (!pendingOpenRef.current) return;
      if (!pickerLoadedRef.current || !gisLoadedRef.current || !tokenClientRef.current) return;

      pendingOpenRef.current = false;

      if (accessTokenRef.current) {
        openPicker(accessTokenRef.current);
        return;
      }

      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    }, [openPicker]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          if (!hasValidGooglePickerConfig()) return;

          pendingOpenRef.current = true;
          flushPendingOpen();

          if (!pickerLoadedRef.current || !gisLoadedRef.current || !tokenClientRef.current) {
            console.warn('Google Drive picker is still loading and will open automatically when ready.');
          }
        },
      }),
      [flushPendingOpen],
    );

    useEffect(() => {
      if (scriptsLoadedRef.current || !hasValidGooglePickerConfig()) return;

      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.onload = () => {
        if (typeof google === 'undefined' || !google.accounts?.oauth2) {
          console.error('Google Identity Services failed to load.');
          return;
        }

        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID!,
          scope: SCOPES,
          callback: (response) => {
            if ('error' in response && response.error) {
              console.error('Google Drive OAuth failed.', response);
              return;
            }

            if (response.access_token) {
              accessTokenRef.current = response.access_token;
              openPicker(response.access_token);
            }
          },
        });

        gisLoadedRef.current = true;
        flushPendingOpen();
      };
      document.body.appendChild(gisScript);

      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.onload = () => {
        if (typeof gapi === 'undefined') {
          console.error('Google API loader failed to initialize.');
          return;
        }

        gapi.load('picker', () => {
          pickerLoadedRef.current = true;
          flushPendingOpen();
        });
      };
      document.body.appendChild(gapiScript);

      scriptsLoadedRef.current = true;
    }, [flushPendingOpen, openPicker]);

    return null;
  },
);

GoogleDrivePicker.displayName = 'GoogleDrivePicker';
