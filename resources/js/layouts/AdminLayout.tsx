// resources/js/Layouts/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Settings,
    Vote,
    Users,
    BarChart3,
    Calendar,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Bell,
    User,
    HelpCircle,
    FileText,
    Shield,
    Sun,
    Moon,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Safely access user data with fallbacks
    const user = auth?.user || null;
    const userName = user?.name || 'Admin User';
    const userEmail = user?.email || 'admin@voicesphere.com';

    // Load dark mode preference from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Helper function to check if a route is active
    const isRouteActive = (href: string) => {
        if (!url) return false;

        // For dashboard - exact match or root path
        if (href === '/dashboard') {
            return url === '/dashboard' || url === '/' || url === '';
        }

        // For other routes, check if the URL starts with the base path
        // This handles nested routes like /elections/123
        return url.startsWith(href);
    };

    // Navigation items with improved active detection
    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: isRouteActive('/dashboard'),
        },
        {
            name: 'Elections',
            href: '/elections',
            icon: Vote,
            current: isRouteActive('/elections'),
        },
        {
            name: 'Voters',
            href: '/voters',
            icon: Users,
            current: isRouteActive('/voters'),
        },
        {
            name: 'Results',
            href: '/results',
            icon: BarChart3,
            current: isRouteActive('/results'),
        },
        {
            name: 'Fraud Analysis',
            href: '/fraud-analysis',
            icon: Shield,
            current: isRouteActive('/fraud-analysis'),
        },
        {
            name: 'Calendar',
            href: '/calendar',
            icon: Calendar,
            current: isRouteActive('/calendar'),
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            current: isRouteActive('/settings'),
        },
    ];

    const secondaryNavigation = [
        { name: 'Help & Support', href: '/help', icon: HelpCircle },
        { name: 'Security', href: '/security', icon: Shield },
        { name: 'Documentation', href: '/docs', icon: FileText },
    ];

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="rounded-lg bg-red-600 p-2 text-white shadow-lg hover:bg-red-700"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Sidebar for desktop */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full bg-white shadow-xl transition-all duration-300 dark:bg-[#161615] ${
                    sidebarOpen ? 'w-64' : 'w-20'
                } hidden md:block`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 items-center justify-between border-b border-[#e3e3e0] px-4 dark:border-[#3E3E3A]">
                    {sidebarOpen ? (
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-red-600"></div>
                            <span className="text-xl font-bold text-[#1b1b18] dark:text-white">
                                Voice
                                <span className="text-red-600">Sphere</span>
                            </span>
                        </div>
                    ) : (
                        <div className="mx-auto h-8 w-8 rounded-full bg-red-600"></div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {sidebarOpen ? (
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                </div>

                {/* Main navigation */}
                <nav className="mt-6 flex h-[calc(100vh-4rem)] flex-1 flex-col justify-between">
                    <div className="space-y-1 px-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                    item.current
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:text-red-500'
                                } ${!sidebarOpen && 'justify-center'}`}
                            >
                                <item.icon
                                    className={`h-5 w-5 ${!sidebarOpen && 'mr-0'} ${sidebarOpen && 'mr-3'} ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-red-600'}`}
                                />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>

                    {/* Secondary navigation */}
                    <div className="mb-6 space-y-1 px-2">
                        <div
                            className={`border-t border-[#e3e3e0] dark:border-[#3E3E3A] ${sidebarOpen ? 'mx-2' : 'mx-0'} my-2`}
                        ></div>
                        {secondaryNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:text-red-500 ${
                                    !sidebarOpen && 'justify-center'
                                }`}
                            >
                                <item.icon
                                    className={`h-5 w-5 ${!sidebarOpen && 'mr-0'} ${sidebarOpen && 'mr-3'} text-gray-400 group-hover:text-red-600`}
                                />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        ))}

                        {/* User section */}
                        <div
                            className={`border-t border-[#e3e3e0] dark:border-[#3E3E3A] ${sidebarOpen ? 'mx-2' : 'mx-0'} my-2`}
                        ></div>
                        <div
                            className={`flex items-center ${sidebarOpen ? 'px-3 py-2' : 'justify-center py-2'}`}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                <User className="h-4 w-4" />
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {userEmail}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20 ${
                                !sidebarOpen && 'justify-center'
                            }`}
                        >
                            <LogOut
                                className={`h-5 w-5 ${!sidebarOpen && 'mr-0'} ${sidebarOpen && 'mr-3'}`}
                            />
                            {sidebarOpen && <span>Logout</span>}
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl dark:bg-[#161615]">
                        <div className="flex h-16 items-center justify-between border-b border-[#e3e3e0] px-4 dark:border-[#3E3E3A]">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-red-600"></div>
                                <span className="text-xl font-bold text-[#1b1b18] dark:text-white">
                                    Voice
                                    <span className="text-red-600">Sphere</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <nav className="mt-6 flex h-[calc(100vh-4rem)] flex-1 flex-col justify-between">
                            <div className="space-y-1 px-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                            item.current
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:text-red-500'
                                        }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="mb-6 space-y-1 px-2">
                                {secondaryNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:text-red-500"
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                <div className="my-2 border-t border-[#e3e3e0] dark:border-[#3E3E3A]"></div>

                                <div className="flex items-center px-3 py-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                            {userName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    <span>Logout</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main content */}
            <main
                className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
            >
                {/* Top header */}
                <header className="sticky top-0 z-30 border-b border-[#e3e3e0] bg-white/80 backdrop-blur-md dark:border-[#3E3E3A] dark:bg-black/80">
                    <div className="flex items-center justify-between px-4 py-3 md:px-6">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                {title || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="relative rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>

                            {/* Notifications */}
                            <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
                            </button>

                            {/* User dropdown */}
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Administrator
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}