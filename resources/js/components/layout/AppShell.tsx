import { Outlet } from 'react-router';
import { Header } from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { lexorankKeys, fetchLexoRankHealth } from '@/api/lexorank';

export function AppShell() {
    const { data: health } = useQuery({
        queryKey: lexorankKeys.health,
        queryFn: fetchLexoRankHealth,
        staleTime: 60_000,
    });

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <Header packageVersion={health?.version} />
            <main className="mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <Outlet />
            </main>
        </div>
    );
}
