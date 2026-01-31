import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { authClient } from '@/lib/auth-client';
import App from './App';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl || typeof convexUrl !== 'string') {
  throw new Error(
    'VITE_CONVEX_URL is required. Set it in apps/web/.env.local (dev) or in your hosting env (prod) to your Convex deployment URL (e.g. https://your-deployment.convex.cloud).'
  );
}

const convex = new ConvexReactClient(convexUrl, {
  expectAuth: true,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Custom OTT handler to fix race condition in cross-domain auth
function OttHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const ott = url.searchParams.get('ott');
      if (ott) {
        // Remove OTT from URL to prevent re-processing
        url.searchParams.delete('ott');
        window.history.replaceState({}, '', url.toString());

        // Verify OTT and wait for cookie to be stored
        const result = await (authClient as any).crossDomain.oneTimeToken.verify({ token: ott });
        if (result.data?.session) {
          // Add a small delay to ensure the onSuccess hook completes
          // and the cookie is stored in localStorage
          await new Promise(resolve => setTimeout(resolve, 100));

          // Then refresh the session to use the new cookie
          await authClient.getSession();

          // Notify the session signal to update React state
          (authClient as any).updateSession();
        }
      }
    })();
  }, []);

  return <>{children}</>;
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <OttHandler>
        {/* Move App inside the provider - it contains BrowserRouter */}
        <App />
      </OttHandler>
    </ConvexBetterAuthProvider>
  </React.StrictMode>
);
