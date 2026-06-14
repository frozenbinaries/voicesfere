import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Vote, Users, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Election {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    start_date: string | null;
    end_date: string | null;
    identifier: string;
    ballots_count?: number;
    voters_count?: number;
}

interface Props {
    elections: Election[];
}

export default function CalendarIndex({ elections }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Add previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        // Add current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDateObj = new Date(year, month, i);
            days.push({ date: currentDateObj, isCurrentMonth: true });
        }
        // Add next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({ date: nextDate, isCurrentMonth: false });
        }

        return days;
    };

    const getElectionsForDate = (date: Date) => {
        return elections.filter(election => {
            if (!election.start_date) return false;
            const startDate = new Date(election.start_date);
            const endDate = election.end_date ? new Date(election.end_date) : startDate;

            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            return targetDate >= startDate && targetDate <= endDate;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-3 w-3" />;
            case 'completed': return <CheckCircle className="h-3 w-3" />;
            case 'paused': return <AlertCircle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    const formatShortDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group elections by month for list view
    const electionsByMonth = useMemo(() => {
        const grouped: Record<string, Election[]> = {};
        elections.forEach(election => {
            if (election.start_date) {
                const date = new Date(election.start_date);
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                if (!grouped[monthKey]) {
                    grouped[monthKey] = [];
                }
                grouped[monthKey].push(election);
            }
        });
        return grouped;
    }, [elections]);

    // Sort months
    const sortedMonths = Object.keys(electionsByMonth).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
    });

    const getMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-').map(Number);
        return new Date(year, month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout title="Calendar">
            <Head title="Election Calendar - VoiceSphere" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1b1b18] dark:text-white">Election Calendar</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View all elections organized by date
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${
                                    viewMode === 'month'
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                } rounded-l-lg`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                } rounded-r-lg`}
                            >
                                List
                            </button>
                        </div>
                        <Link
                            href="/elections/create"
                            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            New Election
                        </Link>
                    </div>
                </div>

                {/* Month View */}
                {viewMode === 'month' && (
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        {/* Calendar Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={goToToday}
                                    className="rounded-lg px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={goToNextMonth}
                                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                {formatDate(currentDate)}
                            </h2>
                        </div>

                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, idx) => {
                                const electionsOnDay = getElectionsForDate(day.date);
                                const isToday = new Date().toDateString() === day.date.toDateString();

                                return (
                                    <div
                                        key={idx}
                                        className={`min-h-[100px] rounded-lg border p-2 transition-all ${
                                            day.isCurrentMonth
                                                ? 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                                                : 'border-[#e3e3e0]/50 bg-gray-50/50 dark:border-[#3E3E3A]/50 dark:bg-gray-900/20'
                                        } ${isToday ? 'ring-2 ring-red-600' : ''}`}
                                    >
                                        <div className={`text-right text-sm ${
                                            day.isCurrentMonth
                                                ? 'text-[#1b1b18] dark:text-white'
                                                : 'text-gray-400 dark:text-gray-600'
                                        } ${isToday ? 'font-bold text-red-600' : ''}`}>
                                            {day.date.getDate()}
                                        </div>
                                        <div className="mt-1 space-y-1">
                                            {electionsOnDay.slice(0, 3).map(election => (
                                                <Link
                                                    key={election.id}
                                                    href={`/elections/${election.id}`}
                                                    className="block truncate rounded px-1 py-0.5 text-xs transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <span className={`inline-flex items-center gap-1 rounded px-1 ${getStatusColor(election.status)}`}>
                                                        {getStatusIcon(election.status)}
                                                        <span className="truncate">{election.title}</span>
                                                    </span>
                                                </Link>
                                            ))}
                                            {electionsOnDay.length > 3 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    +{electionsOnDay.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-6">
                        {sortedMonths.length === 0 ? (
                            <div className="rounded-xl border border-[#e3e3e0] bg-white p-12 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Get started by creating your first election.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href="/elections/create"
                                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Election
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            sortedMonths.map(monthKey => (
                                <div key={monthKey} className="rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                                        <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                            {getMonthName(monthKey)}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                        {electionsByMonth[monthKey].map(election => (
                                            <Link
                                                key={election.id}
                                                href={`/elections/${election.id}`}
                                                className="block transition-all hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                            >
                                                <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-[#1b1b18] dark:text-white">
                                                                {election.title}
                                                            </h4>
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(election.status)}`}>
                                                                {getStatusIcon(election.status)}
                                                                {election.status}
                                                            </span>
                                                        </div>
                                                        {election.description && (
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                {election.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                            {election.start_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="h-3 w-3" />
                                                                    <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                            {election.end_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="h-3 w-3" />
                                                                    <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                <span>{election.voters_count || 0} voters</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <BarChart3 className="h-3 w-3" />
                                                                <span>{election.ballots_count || 0} ballots</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">
                                                            {election.start_date && formatShortDate(new Date(election.start_date))}
                                                            {election.start_date && election.end_date && ' - '}
                                                            {election.end_date && formatShortDate(new Date(election.end_date))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                                <CalendarIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Elections</p>
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">{elections.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Elections</p>
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                    {elections.filter(e => e.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                    {elections.filter(e => {
                                        if (e.status !== 'active') return false;
                                        const startDate = e.start_date ? new Date(e.start_date) : null;
                                        return startDate && startDate > new Date();
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                    {elections.filter(e => e.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}