import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface Option {
    id: number;
    title: string;
    description: string | null;
    should_display_a_photo: boolean;
    photo_url: string | null;
    display_order: number;
}

interface Ballot {
    id: number;
    title: string;
    description: string | null;
    type: string;
    max_selections: number;
    min_selections: number;
    randomize_options: boolean;
    options?: Option[];
}

interface Election {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    start_date: string | null;
    end_date: string | null;
    identifier: string;
    ballots?: Ballot[];
}

interface Props {
    allElections: Election[];
    auth: any;
}

export default function Welcome({ allElections = [] }: Props) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const words = ['Reliable', 'Secure', 'Transparent', 'Fast', 'Accessible'];

    // Load dark mode preference from localStorage or system preference
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

    // Filter active and upcoming elections
    const now = new Date();
    const activeElections = allElections.filter(election => {
        if (election.status !== 'active') return false;
        const startDate = election.start_date ? new Date(election.start_date) : null;
        const endDate = election.end_date ? new Date(election.end_date) : null;

        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;
        return true;
    });

    const upcomingElections = allElections.filter(election => {
        if (election.status !== 'active') return false;
        const startDate = election.start_date ? new Date(election.start_date) : null;
        return startDate && now < startDate;
    });

    const getVoteUrl = (election: Election) => {
        return `/vote/${election.identifier}`;
    };

    const getLeaderboardUrl = (election: Election) => {
        return `/leaderboard/${election.identifier}`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const handleTyping = () => {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                setTypedText(currentWord.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);

                if (charIndex === 0) {
                    setIsDeleting(false);
                    setWordIndex((wordIndex + 1) % words.length);
                }
            } else {
                setTypedText(currentWord.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);

                if (charIndex === currentWord.length) {
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? 50 : 100);
        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, wordIndex, words]);

    // Calculate total stats from all elections
    const totalElections = allElections.length;
    const totalActive = activeElections.length;
    const totalCandidates = allElections.reduce((total, e) =>
        total + (e.ballots?.reduce((ballotTotal, b) => ballotTotal + (b.options?.length || 0), 0) || 0), 0);

    return (
        <>
            <Head title="VoiceSphere - Modern Voting Platform" />

            {/* Full screen gradient background */}
            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                {/* Dark Mode Toggle - Made more visible */}
                <div className="fixed top-4 right-4 z-50">
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-gray-700 shadow-lg transition-all hover:bg-gray-100 dark:bg-[#1f1f1f] dark:text-white dark:hover:bg-[#2d2d2d] border border-[#e3e3e0] dark:border-[#3E3E3A]"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <>
                                <Sun className="h-4 w-4" />
                                <span className="text-sm font-medium">Light</span>
                            </>
                        ) : (
                            <>
                                <Moon className="h-4 w-4" />
                                <span className="text-sm font-medium">Dark</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b border-[#e3e3e0] bg-white/80 backdrop-blur-md dark:border-[#3E3E3A] dark:bg-black/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-red-600"></div>
                                <span className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Voice<span className="text-red-600">Sphere</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-[#1b1b18] transition hover:text-red-600 dark:text-[#EDEDEC]"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight text-[#1b1b18] dark:text-white sm:text-5xl lg:text-6xl">
                                    Elections that are{' '}<br/>
                                    <span className="inline-block text-red-600">
                                        {typedText}
                                        <span className="animate-pulse">|</span>
                                    </span>
                                </h1>
                                <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                    Create, manage, and participate in secure digital elections.
                                    Perfect for organizations, schools, clubs, and communities.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 py-4">
                                <div className="rounded-xl border border-[#e3e3e0] bg-white/80 backdrop-blur-sm p-4 text-center dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                    <div className="text-2xl font-bold text-red-600">{totalElections}+</div>
                                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Total Elections</div>
                                </div>
                                <div className="rounded-xl border border-[#e3e3e0] bg-white/80 backdrop-blur-sm p-4 text-center dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                    <div className="text-2xl font-bold text-red-600">{totalActive}</div>
                                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Active Elections</div>
                                </div>
                                <div className="rounded-xl border border-[#e3e3e0] bg-white/80 backdrop-blur-sm p-4 text-center dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                    <div className="text-2xl font-bold text-red-600">{totalCandidates}+</div>
                                    <div className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Candidates</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                {!auth.user ? (
                                    <>
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:scale-105"
                                        >
                                            Create Your First Election
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="rounded-lg border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white"
                                        >
                                            Learn More
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:scale-105"
                                    >
                                        Go to Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Content - Active Elections */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-600/5 blur-3xl"></div>
                            <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl dark:bg-[#161615]/90">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span>Live Elections</span>
                                        </div>
                                        {activeElections.length > 0 && (
                                            <span className="text-xs text-red-600">{activeElections.length} active</span>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                                        </div>
                                    ) : activeElections.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activeElections.map((election) => (
                                                <div key={election.id} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                                    <h3 className="font-semibold text-[#1b1b18] dark:text-white">
                                                        {election.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        {election.description?.substring(0, 80)}
                                                        {election.description && election.description.length > 80 ? '...' : ''}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                            Ends: {formatDate(election.end_date)}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={getVoteUrl(election)}
                                                                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg"
                                                            >
                                                                Vote Now
                                                                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                </svg>
                                                            </Link>
                                                            <Link
                                                                href={getLeaderboardUrl(election)}
                                                                className="inline-flex items-center rounded-lg border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white"
                                                            >
                                                                Leaderboard
                                                                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                                            <div className="text-4xl mb-2">🗳️</div>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                No active elections at the moment
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Check back later or create your own!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Elections Section - Directly below active elections */}
                    {upcomingElections.length > 0 && (
                        <div className="mt-12">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-[#1b1b18] dark:text-white">
                                    Upcoming Elections
                                </h2>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Get ready to cast your vote in these upcoming elections
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {upcomingElections.map((election) => (
                                    <div key={election.id} className="rounded-xl border border-[#e3e3e0] bg-white/80 backdrop-blur-sm p-4 dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-[#1b1b18] dark:text-white">
                                                {election.title}
                                            </h3>
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                Upcoming
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            {election.description?.substring(0, 80)}
                                            {election.description && election.description.length > 80 ? '...' : ''}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                Starts: {formatDate(election.start_date)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="border-t border-[#e3e3e0] bg-white/50 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#0f0f0f]/50">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-white">
                                Why choose <span className="text-red-600">VoiceSphere</span>?
                            </h2>
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A]">
                                Everything you need to run fair and secure elections
                            </p>
                        </div>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: '🔒', title: 'Secure & Private', desc: 'End-to-end encryption and anonymous voting' },
                                { icon: '⚡', title: 'Real-time Results', desc: 'Live updates as votes come in' },
                                { icon: '🎯', title: 'Easy to Use', desc: 'Intuitive interface for voters and admins' },
                                { icon: '📊', title: 'Advanced Analytics', desc: 'Detailed insights and exportable reports' },
                                { icon: '🛡️', title: 'Audit Trail', desc: 'Complete logs for transparency' },
                                { icon: '🌍', title: 'Accessible', desc: 'Works on all devices, 24/7 support' },
                            ].map((feature, idx) => (
                                <div key={idx} className="group rounded-xl border border-[#e3e3e0] bg-white/80 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:scale-105 dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                    <div className="mb-4 inline-flex rounded-xl bg-red-600 p-3 text-2xl text-white transition-all group-hover:scale-110">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-[#1b1b18] dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                Ready to run your first election?
                            </h2>
                            <p className="mt-4 text-white/90">
                                Join thousands of organizations using VoiceSphere
                            </p>
                            <div className="mt-6">
                                {!auth.user ? (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-red-600 transition-all hover:scale-105 hover:shadow-xl"
                                    >
                                        Start Free
                                        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-red-600 transition-all hover:scale-105 hover:shadow-xl"
                                    >
                                        Create Election
                                        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-[#e3e3e0] bg-white/50 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a]/50">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            <p>&copy; 2026 VoiceSphere. All rights reserved.</p>
                            <p className="mt-2">
                                Every voice matters. Every vote counts.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}