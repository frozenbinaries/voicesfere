// resources/js/pages/Leaderboard/LeaderboardOff.tsx
import { Head, Link, router } from '@inertiajs/react';
import { Lock, EyeOff, ArrowLeft, Home, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

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
                    <CheckCircle className="h-3 w-3" />
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

    // Safely check if election exists
    if (!election) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
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

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                        {/* Icon */}
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <EyeOff className="h-10 w-10 text-red-600" />
                        </div>

                        {/* Title */}
                        <h1 className="mb-2 text-2xl font-bold text-[#1b1b18] dark:text-white">
                            Leaderboard Unavailable
                        </h1>

                        {/* Message */}
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                            {message || `The leaderboard for "${election.title}" is currently not available.`}
                        </p>

                        {/* Election Info */}
                        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left dark:bg-gray-900/20">
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

                        {/* Reason for unavailability */}
                        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-left dark:bg-yellow-900/20">
                            <div className="flex items-start gap-2">
                                <Lock className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-500" />
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

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
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

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>Need assistance? Contact the election administrator for more information.</p>
                    </div>
                </div>
            </div>
        </>
    );
}