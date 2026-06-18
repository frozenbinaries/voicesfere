import { Head, Link } from '@inertiajs/react';
import {
    Trophy, Users, BarChart3, Medal, CheckCircle, Clock,
    ArrowLeft, RefreshCw, TrendingUp, Activity, Zap, Sparkles,
    Sun, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Option {
    option_id: number;
    option_title: string;
    option_description: string | null;
    photo_url: string | null;
    should_display_a_photo: boolean;
    vote_count: number;
    percentage: number;
}

interface BallotResult {
    ballot_id: number;
    ballot_title: string;
    ballot_type: string;
    total_votes: number;
    options: Option[];
}

interface Election {
    id: number;
    title: string;
    description: string | null;
    identifier: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
}

interface Props {
    election: Election;
    leaderboard: Record<number, BallotResult>;
}

export default function Leaderboard({ election, leaderboard: initialLeaderboard }: Props) {
    const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
    const [viewMode, setViewMode] = useState<'ballot' | 'overall'>('ballot');
    const [autoRefresh, setAutoRefresh] = useState<number | 'off'>(5);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [animatedRows, setAnimatedRows] = useState<Set<number>>(new Set());
    const [isDarkMode, setIsDarkMode] = useState(false);

    const isActive = election.status === 'active';

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

    useEffect(() => {
        if (autoRefresh === 'off') return;
        const interval = setInterval(() => {
            handleRefresh();
        }, autoRefresh * 1000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await fetch(`/api/leaderboard/${election.identifier}`);

            if (!response.ok) {
                if (response.status === 403 || response.status === 404) {
                    window.location.href = `/leaderboard/${election.identifier}`;
                    return;
                }
                throw new Error('Failed to fetch leaderboard');
            }

            const data = await response.json();

            if (data.leaderboard_available === false) {
                window.location.href = `/leaderboard/${election.identifier}`;
                return;
            }

            const oldLeaderboard = leaderboard;
            const newLeaderboard = data.leaderboard;

            const changedOptionIds: number[] = [];
            Object.values(newLeaderboard).forEach((ballot: any) => {
                ballot.options.forEach((option: any) => {
                    const oldBallot = oldLeaderboard[ballot.ballot_id];
                    const oldOption = oldBallot?.options.find((o: any) => o.option_id === option.option_id);
                    if (oldOption && oldOption.vote_count !== option.vote_count) {
                        changedOptionIds.push(option.option_id);
                    }
                });
            });

            setAnimatedRows(new Set(changedOptionIds));
            setLeaderboard(newLeaderboard);
            setLastUpdated(new Date());

            setTimeout(() => {
                setAnimatedRows(new Set());
            }, 1000);
        } catch (error) {
            console.error('Failed to refresh leaderboard:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getStatusBadge = () => {
        if (election.status === 'active') {
            return (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                    <Activity className="h-3 w-3" />
                    Live
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
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
        return null;
    };

    const getLeaderPerBallot = () => {
        const leaders = [];

        for (const ballot of Object.values(leaderboard)) {
            if (ballot.options.length === 0) continue;

            const sorted = [...ballot.options].sort((a, b) => b.vote_count - a.vote_count);
            const topVote = sorted[0].vote_count;
            const secondVote = sorted[1]?.vote_count || 0;

            if (topVote > secondVote) {
                leaders.push({
                    ...sorted[0],
                    ballot_title: ballot.ballot_title,
                    ballot_type: ballot.ballot_type,
                });
            }
        }

        return leaders.sort((a, b) => b.vote_count - a.vote_count);
    };

    const totalVotes = Object.values(leaderboard).reduce(
        (total, ballot) => total + ballot.total_votes,
        0
    );

    const leaders = getLeaderPerBallot();

    const getVoteAnimation = (optionId: number) => {
        if (animatedRows.has(optionId)) {
            return 'animate-bounce-once scale-110 text-red-600 transition-all duration-300';
        }
        return '';
    };

    return (
        <>
            <Head title={`Leaderboard - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                {/* Dark Mode Toggle */}
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

                {/* Animated background for active election */}
                {isActive && (
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-20 left-10 animate-float-slow opacity-20">
                            <Zap className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="absolute bottom-20 right-10 animate-float-delayed opacity-20">
                            <Activity className="h-10 w-10 text-red-500" />
                        </div>
                        <div className="absolute top-1/3 right-1/4 animate-pulse-slow opacity-10">
                            <Sparkles className="h-16 w-16 text-red-500" />
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className={`inline-flex items-center justify-center rounded-full p-3 ${isActive ? 'animate-pulse bg-red-200 dark:bg-red-800/50' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <Trophy className={`h-8 w-8 ${isActive ? 'text-red-700 dark:text-red-300' : 'text-red-600'}`} />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold text-[#1b1b18] dark:text-white">
                            {election.title}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Current standings and results
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
                            {getStatusBadge()}
                            <div className={`flex items-center gap-1 text-sm ${isActive ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-500'}`}>
                                <Users className="h-4 w-4" />
                                <span>{totalVotes} votes cast</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <BarChart3 className="h-4 w-4" />
                                <span>{Object.keys(leaderboard).length} Ballots</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                            <div className="flex rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <button
                                    onClick={() => setViewMode('ballot')}
                                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                                        viewMode === 'ballot'
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    } rounded-l-lg`}
                                >
                                    By Ballot
                                </button>
                                <button
                                    onClick={() => setViewMode('overall')}
                                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                                        viewMode === 'overall'
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    } rounded-r-lg`}
                                >
                                    Leaders
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</span>
                            <select
                                value={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.value === 'off' ? 'off' : Number(e.target.value))}
                                className="rounded-lg border border-[#e3e3e0] px-3 py-1.5 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            >
                                <option value="off">Off</option>
                                <option value="5">Every 5 seconds</option>
                                <option value="10">Every 10 seconds</option>
                                <option value="30">Every 30 seconds</option>
                            </select>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {formatTime(lastUpdated)}
                        </div>
                    </div>

                    {/* Leaderboard Content */}
                    <div className="space-y-8">
                        {viewMode === 'ballot' ? (
                            Object.values(leaderboard).map((ballot) => {
                                const sorted = [...ballot.options].sort((a, b) => b.vote_count - a.vote_count);
                                const hasTie = sorted[0]?.vote_count === sorted[1]?.vote_count;

                                return (
                                    <div
                                        key={ballot.ballot_id}
                                        className={`rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] ${
                                            isActive ? 'hover:shadow-md transition-all duration-300' : ''
                                        }`}
                                    >
                                        <div className="border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                                            <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                                {ballot.ballot_title}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <BarChart3 className="h-3 w-3" />
                                                    {ballot.total_votes} votes
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                                                    {ballot.ballot_type.replace('_', ' ')}
                                                </span>
                                                {hasTie && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        Tie - No clear leader
                                                    </span>
                                                )}
                                                {isActive && !hasTie && sorted[0] && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                                                        <Activity className="h-2 w-2" />
                                                        Leading
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                            {ballot.options.map((option, index) => {
                                                const isLeader = index === 0 && !hasTie;
                                                const isTied = hasTie && index === 0;
                                                const hasVoteChange = animatedRows.has(option.option_id);

                                                return (
                                                    <div
                                                        key={option.option_id}
                                                        className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 ${
                                                            isLeader ? 'bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20' : ''
                                                        } ${hasVoteChange ? 'animate-slide-up bg-green-50 dark:bg-green-950/20' : ''}`}
                                                    >
                                                        <div className="flex w-12 shrink-0 items-center justify-center">
                                                            {isLeader && <Trophy className={`h-6 w-6 text-yellow-500 ${isActive ? 'animate-bounce' : ''}`} />}
                                                            {!isLeader && !isTied && <span className="text-gray-400 font-medium">#{index + 1}</span>}
                                                            {isTied && <span className="text-gray-400 font-medium">Tie</span>}
                                                        </div>

                                                        {option.should_display_a_photo && option.photo_url && (
                                                            <div className="shrink-0">
                                                                <img
                                                                    src={option.photo_url}
                                                                    alt={option.option_title}
                                                                    className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <h3 className="font-medium text-[#1b1b18] dark:text-white">
                                                                    {option.option_title}
                                                                </h3>
                                                                {isLeader && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                        <TrendingUp className="h-3 w-3" />
                                                                        Leading
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {option.option_description && (
                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                    {option.option_description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold text-[#1b1b18] dark:text-white transition-all duration-300 ${getVoteAnimation(option.option_id)}`}>
                                                                {option.vote_count.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                votes
                                                            </div>
                                                        </div>

                                                        <div className="w-32">
                                                            <div className="mb-1 text-right text-xs text-gray-500">
                                                                {option.percentage}%
                                                            </div>
                                                            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className={`h-full rounded-full bg-red-600 transition-all duration-500 ${
                                                                        hasVoteChange ? 'animate-pulse' : ''
                                                                    }`}
                                                                    style={{ width: `${option.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            // Leaders View
                            <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                                    <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                        Current Leaders
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Leading candidate from each ballot (ties excluded)
                                    </p>
                                </div>

                                <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                    {leaders.length === 0 ? (
                                        <div className="px-6 py-12 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No clear leaders at the moment. Votes may be tied.
                                            </p>
                                        </div>
                                    ) : (
                                        leaders.map((leader, index) => {
                                            const hasVoteChange = animatedRows.has(leader.option_id);
                                            return (
                                                <div
                                                    key={leader.option_id}
                                                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 ${
                                                        hasVoteChange ? 'animate-slide-up bg-green-50 dark:bg-green-950/20' : ''
                                                    }`}
                                                >
                                                    <div className="flex w-12 shrink-0 items-center justify-center">
                                                        {index === 0 && <Trophy className={`h-6 w-6 text-yellow-500 ${isActive ? 'animate-bounce' : ''}`} />}
                                                        {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                                                        {index === 2 && <Medal className="h-6 w-6 text-amber-600" />}
                                                        {index > 2 && <span className="text-gray-400 font-medium">#{index + 1}</span>}
                                                    </div>

                                                    {leader.should_display_a_photo && leader.photo_url && (
                                                        <div className="shrink-0">
                                                            <img
                                                                src={leader.photo_url}
                                                                alt={leader.option_title}
                                                                className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <h3 className="font-medium text-[#1b1b18] dark:text-white">
                                                                {leader.option_title}
                                                            </h3>
                                                            {index === 0 && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse">
                                                                    <TrendingUp className="h-3 w-3" />
                                                                    Top Leader
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {leader.ballot_title}
                                                        </p>
                                                        {leader.option_description && (
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                {leader.option_description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <div className={`text-lg font-bold text-[#1b1b18] dark:text-white transition-all duration-300 ${getVoteAnimation(leader.option_id)}`}>
                                                            {leader.vote_count.toLocaleString()}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            votes
                                                        </div>
                                                    </div>

                                                    <div className="w-32">
                                                        <div className="mb-1 text-right text-xs text-gray-500">
                                                            {leader.percentage}%
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className={`h-full rounded-full bg-red-600 transition-all duration-500 ${
                                                                    hasVoteChange ? 'animate-pulse' : ''
                                                                }`}
                                                                style={{ width: `${leader.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isActive ? (
                            <div className="animate-pulse-slow">
                                <p className="inline-flex items-center gap-2">
                                    <Activity className="h-3 w-3 text-red-500" />
                                    Live results - updating in real-time
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p>Results are final as votes have been counted.</p>
                        )}
                        {election.status === 'active' && (
                            <p className="mt-1">
                                Election ends on {formatDate(election.end_date)}
                            </p>
                        )}
                        {autoRefresh !== 'off' && (
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Auto-refreshing every {autoRefresh} seconds
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add custom CSS for animations */}
            <style jsx>{`
                @keyframes bounce-once {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                .animate-bounce-once {
                    animation: bounce-once 0.5s ease-in-out;
                }
                @keyframes slide-up {
                    0% { opacity: 0.5; transform: translateY(5px); background-color: rgba(34, 197, 94, 0.2); }
                    100% { opacity: 1; transform: translateY(0); background-color: transparent; }
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out;
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-10px) translateX(5px); }
                    75% { transform: translateY(10px) translateX(-5px); }
                }
                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-slow 10s ease-in-out infinite reverse;
                    animation-delay: 2s;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.2; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}