import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

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

    const openPicker = useCallback(
      (accessToken: string) => {
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
          .setIncludeFolders(false)
          .setSelectFolderEnabled(false);

        const picker = new google.picker.PickerBuilder()
          .setAppId(GOOGLE_CLIENT_ID)
          .setOAuthToken(accessToken)
          .setDeveloperKey(GOOGLE_API_KEY)
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

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          if (!tokenClientRef.current) return;
          if (accessTokenRef.current) {
            openPicker(accessTokenRef.current);
          } else {
            tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
          }
        },
      }),
      [openPicker],
    );

    useEffect(() => {
      if (scriptsLoadedRef.current) return;

      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.onload = () => {
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              accessTokenRef.current = response.access_token;
              openPicker(response.access_token);
            }
          },
        });
      };
      document.body.appendChild(gisScript);

      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.onload = () => {
        gapi.load('picker', () => {});
      };
      document.body.appendChild(gapiScript);

      scriptsLoadedRef.current = true;
    }, [openPicker]);

    return null;
  },
);

GoogleDrivePicker.displayName = 'GoogleDrivePicker';
