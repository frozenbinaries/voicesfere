// resources/js/pages/Leaderboard/LeaderboardOff.tsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Lock, EyeOff, ArrowLeft, Home, Calendar, Clock, RefreshCw, Sun, Moon, Mail, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Election {
    id: number;
    title: string;
    identifier: string;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
}

interface Props {
    election: Election;
    message: string;
}

export default function LeaderboardOff({ election, message }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [emailError, setEmailError] = useState('');

    // Use Inertia's useForm hook for better error handling
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        election_id: election.id,
        election_identifier: election.identifier,
    });

    // Initialize theme based on device preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? 'dark' : 'light';
            setTheme(defaultTheme);
            applyTheme(defaultTheme);
        }
    }, []);

    const applyTheme = (newTheme: 'light' | 'dark') => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            onFinish: () => {
                setRefreshing(false);
            }
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = () => {
        if (election.status === 'active') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <Clock className="h-3 w-3" />
                    Active
                </span>
            );
        }
        if (election.status === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    Completed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-3 w-3" />
                {election.status}
            </span>
        );
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        clearErrors();

        // Client-side validation
        if (!data.email) {
            setEmailError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Submit using Inertia's useForm
        post('/subscribe-results', {
            onSuccess: () => {
                setEmailSubmitted(true);
                setTimeout(() => {
                    setShowEmailModal(false);
                    setEmailSubmitted(false);
                    reset();
                }, 3000);
            },
            onError: (errors) => {
                // Errors are automatically populated in the errors object
                // You can also show a general error message
                if (errors.email) {
                    setEmailError(errors.email);
                } else {
                    setEmailError('Failed to subscribe. Please try again.');
                }
            },
        });
    };

    const openEmailModal = () => {
        setShowEmailModal(true);
        setEmailError('');
        setEmailSubmitted(false);
        reset(); // Reset the form when opening
        setData('email', ''); // Clear email field
    };

    const closeEmailModal = () => {
        if (!emailSubmitted && !processing) {
            setShowEmailModal(false);
            setEmailError('');
            reset();
        }
    };

    // Safely check if election exists
    if (!election) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                    <h2 className="text-2xl font-bold text-[#1b1b18] dark:text-white">Election Not Found</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">The election you're looking for does not exist.</p>
                    <Link href="/" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                        <Home className="h-4 w-4" />
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`Leaderboard - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                <div className="w-full max-w-[70%] px-4 py-8">
                    {/* Header with Theme Toggle */}
                    <div className="mb-8 flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-[#161615]">
                        <div className="max-w-2xl mx-auto">
                            {/* Icon */}
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <EyeOff className="h-10 w-10 text-red-600" />
                            </div>

                            {/* Title */}
                            <h1 className="mb-2 text-3xl font-bold text-center text-[#1b1b18] dark:text-white">
                                Leaderboard Unavailable
                            </h1>

                            {/* Message */}
                            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                {message || `The leaderboard for "${election.title}" is currently not available.`}
                            </p>

                            {/* Two Column Layout for Info and Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Election Info */}
                                <div>
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
                                        <h3 className="mb-3 font-semibold text-[#1b1b18] dark:text-white">
                                            Election Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Election:</span>
                                                <span className="font-medium text-[#1b1b18] dark:text-white">
                                                    {election.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                {getStatusBadge()}
                                            </div>
                                            {election.start_date && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                                                    <span className="text-sm text-[#1b1b18] dark:text-white">
                                                        {formatDate(election.start_date)}
                                                    </span>
                                                </div>
                                            )}
                                            {election.end_date && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">End Date:</span>
                                                    <span className="text-sm text-[#1b1b18] dark:text-white">
                                                        {formatDate(election.end_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Actions and Subscription */}
                                <div className="space-y-4">
                                    {/* Reason for unavailability */}
                                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                        <div className="flex items-start gap-2">
                                            <Lock className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                                            <div className="text-sm text-yellow-800 dark:text-yellow-300">
                                                <p className="font-medium">Why is the leaderboard unavailable?</p>
                                                <ul className="mt-1 list-inside list-disc text-xs">
                                                    <li>The election administrator has disabled public leaderboard visibility</li>
                                                    <li>Results may be hidden until the election ends</li>
                                                    <li>Check back later or contact the election administrator</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Subscription Prompt */}
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <div className="flex items-start gap-2">
                                            <Mail className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                                <p className="font-medium">Get Results via Email</p>
                                                <p className="mt-1 text-xs">
                                                    Enter your email to receive the election results once they're available.
                                                </p>
                                                <button
                                                    onClick={openEmailModal}
                                                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700"
                                                >
                                                    <Mail className="h-3 w-3" />
                                                    Subscribe for Results
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Full Width */}
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {refreshing ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                            Refreshing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            Refresh
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={`/vote/${election.identifier}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
                                >
                                    Go to Voting Page
                                </Link>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Home className="h-4 w-4" />
                                    Return Home
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>Need assistance? Contact the election administrator for more information.</p>
                    </div>
                </div>
            </div>

            {/* Email Subscription Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#161615]">
                        {/* Close Button */}
                        <button
                            onClick={closeEmailModal}
                            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            disabled={emailSubmitted || processing}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Content */}
                        {emailSubmitted ? (
                            <div className="text-center py-8">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1b1b18] dark:text-white">
                                    Successfully Subscribed!
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    We'll send the results to <strong>{data.email}</strong> once the election is complete.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-[#1b1b18] dark:text-white">
                                        Get Results via Email
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Enter your email address below to receive the election results when they become available.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                setEmailError('');
                                                clearErrors();
                                            }}
                                            placeholder="you@example.com"
                                            className={`mt-1 block w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:text-white dark:bg-[#0a0a0a] ${
                                                emailError || errors.email
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
                                                    : 'border-[#e3e3e0] focus:border-red-500 focus:ring-red-500/20 dark:border-[#3E3E3A] dark:focus:border-red-400'
                                            }`}
                                            disabled={processing}
                                            autoFocus
                                        />
                                        {(emailError || errors.email) && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {emailError || errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeEmailModal}
                                            className="flex-1 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                                            disabled={processing}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                'Subscribe'
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <Mail className="inline h-3 w-3 mr-1" />
                                        We'll only use your email to send results. No spam.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}