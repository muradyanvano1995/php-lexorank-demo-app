import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { AboutPage } from '@/pages/AboutPage';
import { BoardPage } from '@/pages/BoardPage';
import { DiagnosticsPage } from '@/pages/DiagnosticsPage';
import { PlaygroundPage } from '@/pages/PlaygroundPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            { index: true, element: <BoardPage /> },
            { path: 'diagnostics', element: <DiagnosticsPage /> },
            { path: 'playground', element: <PlaygroundPage /> },
            { path: 'about', element: <AboutPage /> },
        ],
    },
]);
