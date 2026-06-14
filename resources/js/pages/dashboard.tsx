import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { BarChart3, Users, Vote, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, Plus, Mail, FileText } from 'lucide-react';

// Define the props interface
interface DashboardProps {
    stats?: {
        totalElections: number;
        totalVoters: number;
        totalVotes: number;
        activeElections: number;
        changes: {
            elections: string;
            voters: string;
            votes: string;
            active: string;
        };
    };
    recentElections?: Array<{
        id: number;
        title: string;
        status: string;
        end_date: string;
        turnout: number;
        votes_count: number;
    }>;
    recentActivities?: Array<{
        id: number;
        action: string;
        created_at: string;
        type: string;
    }>;
}

export default function Dashboard({ stats, recentElections, recentActivities }: DashboardProps) {
    // Mock data as fallback when props are not provided
    const mockStats = {
        totalElections: 12,
        totalVoters: 2847,
        totalVotes: 1892,
        activeElections: 3,
        changes: {
            elections: '+3',
            voters: '+12%',
            votes: '+8%',
            active: '-1',
        },
    };

    const mockElections = [
        {
            id: 1,
            title: 'Student Council Election 2026',
            status: 'active',
            end_date: '2026-06-15',
            turnout: 67,
            votes_count: 1342,
        },
        {
            id: 2,
            title: 'Board of Directors Vote',
            status: 'completed',
            end_date: '2026-06-01',
            turnout: 89,
            votes_count: 445,
        },
        {
            id: 3,
            title: 'Annual Budget Approval',
            status: 'draft',
            end_date: '2026-06-30',
            turnout: 0,
            votes_count: 0,
        },
        {
            id: 4,
            title: 'Community Representative Election',
            status: 'active',
            end_date: '2026-06-20',
            turnout: 45,
            votes_count: 892,
        },
    ];

    const mockActivities = [
        { id: 1, action: 'New voter registered', created_at: new Date().toISOString(), type: 'voter' },
        { id: 2, action: 'Election "Student Council" ended', created_at: new Date(Date.now() - 3600000).toISOString(), type: 'election' },
        { id: 3, action: 'Vote cast in Board Election', created_at: new Date(Date.now() - 10800000).toISOString(), type: 'vote' },
        { id: 4, action: 'New election created: Annual Budget', created_at: new Date(Date.now() - 18000000).toISOString(), type: 'election' },
    ];

    // Use provided props or fallback to mock data
    const data = {
        stats: stats || mockStats,
        recentElections: recentElections || mockElections,
        recentActivities: recentActivities || mockActivities,
    };

    const statCards = [
        {
            title: 'Total Elections',
            value: data.stats.totalElections.toString(),
            change: data.stats.changes.elections,
            changeType: data.stats.changes.elections.startsWith('+') ? 'increase' : 'decrease',
            icon: Vote,
            color: 'bg-red-600',
            href: '/elections',
        },
        {
            title: 'Total Voters',
            value: data.stats.totalVoters.toLocaleString(),
            change: data.stats.changes.voters,
            changeType: data.stats.changes.voters.startsWith('+') ? 'increase' : 'decrease',
            icon: Users,
            color: 'bg-blue-600',
            href: '/voters',
        },
        {
            title: 'Votes Cast',
            value: data.stats.totalVotes.toLocaleString(),
            change: data.stats.changes.votes,
            changeType: data.stats.changes.votes.startsWith('+') ? 'increase' : 'decrease',
            icon: CheckCircle,
            color: 'bg-green-600',
            href: '/results',
        },
        {
            title: 'Active Elections',
            value: data.stats.activeElections.toString(),
            change: data.stats.changes.active,
            changeType: data.stats.changes.active.startsWith('+') ? 'increase' : 'decrease',
            icon: Calendar,
            color: 'bg-yellow-600',
            href: '/elections?status=active',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Clock className="mr-1 h-3 w-3" />
                        Active
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        Draft
                    </span>
                );
            default:
                return null;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'voter':
                return <Users className="h-3 w-3 text-blue-600" />;
            case 'election':
                return <Vote className="h-3 w-3 text-red-600" />;
            case 'vote':
                return <CheckCircle className="h-3 w-3 text-green-600" />;
            default:
                return <Clock className="h-3 w-3 text-gray-600" />;
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return `${Math.floor(diffInHours / 24)} days ago`;
    };

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard - VoiceSphere" />

            <div className="space-y-6">
                {/* Welcome Section */}
                {/* <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-800 p-6 text-white shadow-xl">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Welcome back!</h2>
                            <p className="mt-2 text-white/90">
                                Here's what's happening with your elections today.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
                                <TrendingUp className="h-5 w-5" />
                                <span className="text-sm font-medium">+15% growth this month</span>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="group relative overflow-hidden rounded-xl border border-[#e3e3e0] bg-white p-6 transition-all hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.title}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-[#1b1b18] dark:text-white">
                                        {stat.value}
                                    </p>
                                    <div className="mt-2 flex items-center">
                                        <span
                                            className={`text-sm ${
                                                stat.changeType === 'increase'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {stat.change}
                                        </span>
                                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                            from last month
                                        </span>
                                    </div>
                                </div>
                                <div className={`rounded-full ${stat.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300 group-hover:w-full"></div>
                        </Link>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                Voter Turnout
                            </h3>
                            <select className="rounded-lg border border-[#e3e3e0] px-3 py-1 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 3 months</option>
                            </select>
                        </div>
                        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-900/20">
                            <div className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Chart component will be integrated here
                                </p>
                                <p className="text-xs text-gray-400">
                                    Use Chart.js or Recharts library
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h3 className="mb-4 text-lg font-semibold text-[#1b1b18] dark:text-white">
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {data.recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="mt-1 rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-[#1b1b18] dark:text-white">
                                            {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(activity.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 text-center">
                            <Link
                                href="/activity"
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-500"
                            >
                                View all activity →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Elections Table */}
                <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                            Recent Elections
                        </h3>
                        <Link
                            href="/elections"
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-500"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Election Title
                                    </th>
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                        End Date
                                    </th>
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Turnout
                                    </th>
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Votes
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentElections.map((election) => (
                                    <tr
                                        key={election.id}
                                        className="border-b border-[#e3e3e0] transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:hover:bg-gray-900/50"
                                    >
                                        <td className="py-3 text-sm font-medium text-[#1b1b18] dark:text-white">
                                            <Link href={`/elections/${election.id}`} className="hover:text-red-600">
                                                {election.title}
                                            </Link>
                                        </td>
                                        <td className="py-3">{getStatusBadge(election.status)}</td>
                                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(election.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-full rounded-full bg-red-600"
                                                        style={{ width: `${election.turnout}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {election.turnout}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {election.votes_count.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Link
                        href="/elections/create"
                        className="group rounded-xl border-2 border-dashed border-[#e3e3e0] bg-white p-6 text-center transition-all hover:border-red-600 hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]"
                    >
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 transition-all group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30">
                            <Plus className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-[#1b1b18] dark:text-white">
                            Create New Election
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Start a new voting process
                        </p>
                    </Link>

                    <Link
                        href="/voters/invite"
                        className="group rounded-xl border-2 border-dashed border-[#e3e3e0] bg-white p-6 text-center transition-all hover:border-red-600 hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]"
                    >
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 transition-all group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-[#1b1b18] dark:text-white">
                            Invite Voters
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add voters to your election
                        </p>
                    </Link>

                    <Link
                        href="/reports"
                        className="group rounded-xl border-2 border-dashed border-[#e3e3e0] bg-white p-6 text-center transition-all hover:border-red-600 hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]"
                    >
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 transition-all group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-[#1b1b18] dark:text-white">
                            View Reports
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Analyze election results
                        </p>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}