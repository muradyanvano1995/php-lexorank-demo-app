import { Activity, FlaskConical, Info, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const navItems = [
    { to: '/', label: 'Board', icon: LayoutDashboard, end: true },
    { to: '/diagnostics', label: 'Diagnostics', icon: Activity },
    { to: '/playground', label: 'Playground', icon: FlaskConical },
    { to: '/about', label: 'About', icon: Info },
] as const;

type HeaderProps = {
    packageVersion?: string;
};

export function Header({ packageVersion }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-overlay/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-6">
                    <div className="min-w-0">
                        <p className="font-display text-base font-semibold tracking-tight text-foreground">
                            LexoRank Lab
                        </p>
                        <p className="truncate text-xs text-muted">Fractional indexing kanban</p>
                    </div>
                    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                        {navItems.map(({ to, label, icon: Icon, ...item }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={'end' in item ? item.end : false}
                                className={({ isActive }) =>
                                    cn(
                                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium motion-safe-transition',
                                        isActive
                                            ? 'bg-accent-muted text-accent'
                                            : 'text-muted hover:bg-surface-raised hover:text-foreground',
                                    )
                                }
                            >
                                <Icon className="h-4 w-4" aria-hidden />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    {packageVersion ? (
                        <Badge className="hidden sm:inline-flex">v{packageVersion}</Badge>
                    ) : null}
                    <ThemeToggle />
                </div>
            </div>
            <nav
                aria-label="Mobile"
                className="flex gap-1 overflow-x-auto border-t border-border-subtle px-4 py-2 md:hidden"
            >
                {navItems.map(({ to, label, icon: Icon, ...item }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={'end' in item ? item.end : false}
                        className={({ isActive }) =>
                            cn(
                                'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                                isActive ? 'bg-accent-muted text-accent' : 'text-muted',
                            )
                        }
                    >
                        <Icon className="h-4 w-4" aria-hidden />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
