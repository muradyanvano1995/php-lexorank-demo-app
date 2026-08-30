import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ToastShell } from '@/components/ui/Toast';
import { initTheme } from '@/lib/theme';
import { router } from '@/router';
import '../css/app.css';

initTheme();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastShell>
                <RouterProvider router={router} />
            </ToastShell>
        </QueryClientProvider>
    </StrictMode>,
);
