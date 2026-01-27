'use client';

import { useState } from 'react';
import { 
    Users, FileText, TrendingUp, Settings, Bell, 
    Plus, Edit, Trash2, Download, Upload, Search,
    Mail, Lock, User, ArrowRight, Zap, Shield, Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Counter, AnimatedCounter } from '@/components/ui/Counter';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Tabs, Accordion } from '@/components/ui/Tabs';
import { Timeline } from '@/components/ui/Timeline';
import { Tooltip, Popover } from '@/components/ui/Tooltip';
import { StatsCard, QuickActionCard } from '@/components/ui/StatsCard';
import { Sparkline, MiniChart } from '@/components/ui/Sparkline';
import { EmptyState, SearchEmpty } from '@/components/ui/EmptyState';
import { Dropdown, Select } from '@/components/ui/Dropdown';
import { Alert, CodeBlock, Callout } from '@/components/ui/Alert';

export default function ComponentShowcasePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedOption, setSelectedOption] = useState('');

    const tabItems = [
        { id: 'overview', label: 'Overview', icon: <Zap className="w-4 h-4" /> },
        { id: 'users', label: 'Users', badge: 12 },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'disabled', label: 'Disabled', disabled: true },
    ];

    const accordionItems = [
        {
            id: '1',
            title: 'What is Premium UI?',
            content: 'Premium UI is a collection of beautifully crafted components designed to enhance your web applications with modern aesthetics and smooth animations.',
        },
        {
            id: '2',
            title: 'How to use these components?',
            content: 'Simply import the components from the @/components/ui directory and use them in your React/Next.js applications. All components are fully typed with TypeScript.',
        },
        {
            id: '3',
            title: 'Are these components customizable?',
            content: 'Yes! All components support various props for customization including variants, sizes, colors, and more. You can also extend styles using className prop.',
        },
    ];

    const timelineItems = [
        { id: '1', title: 'Project Started', description: 'Initial setup and planning', date: 'Jan 15, 2026', status: 'completed' as const },
        { id: '2', title: 'Development Phase', description: 'Building core features', date: 'Jan 20, 2026', status: 'completed' as const },
        { id: '3', title: 'Testing & QA', description: 'Quality assurance in progress', date: 'Jan 25, 2026', status: 'current' as const },
        { id: '4', title: 'Launch', description: 'Production deployment', date: 'Feb 1, 2026', status: 'pending' as const },
    ];

    const sparklineData = [5, 10, 5, 20, 8, 15, 22, 30, 25, 35, 28, 40];

    const dropdownItems = [
        { id: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" /> },
        { id: 'download', label: 'Download', icon: <Download className="w-4 h-4" /> },
        { id: 'divider', label: '', divider: true },
        { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
    ];

    const selectOptions = [
        { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
        { value: 'user', label: 'User', icon: <User className="w-4 h-4" /> },
        { value: 'guest', label: 'Guest', icon: <Star className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-pattern p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center animate-slideUp">
                    <h1 className="text-4xl font-display font-bold text-gradient mb-4">
                        Premium UI Components
                    </h1>
                    <p className="text-charcoal-600 text-lg max-w-2xl mx-auto">
                        A showcase of beautiful, modern UI components built for your B2B application.
                        All components feature smooth animations, multiple variants, and are fully responsive.
                    </p>
                </div>

                {/* Buttons Section */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="gradient" glow>Gradient</Button>
                        <Button variant="primary" loading>Loading</Button>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>With Icon</Button>
                        <Button variant="primary" size="lg" rounded="full">Rounded</Button>
                    </div>
                </section>

                {/* Inputs Section */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input 
                            label="Default Input" 
                            placeholder="Enter text..." 
                            icon={<Search className="w-5 h-5" />}
                        />
                        <Input 
                            label="Email Input" 
                            placeholder="your@email.com" 
                            icon={<Mail className="w-5 h-5" />}
                            variant="filled"
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="Enter password"
                            icon={<Lock className="w-5 h-5" />}
                        />
                        <Input 
                            label="With Error" 
                            placeholder="Invalid input"
                            error="This field is required"
                        />
                        <Input 
                            label="With Success" 
                            placeholder="Valid input"
                            success="Looks good!"
                            defaultValue="Valid Value"
                        />
                        <Input 
                            label="Glass Style" 
                            placeholder="Glassmorphism..."
                            variant="glass"
                        />
                    </div>
                </section>

                {/* Stats Cards Section */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Stats Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Users"
                            value="12,458"
                            change={{ value: 12, label: 'vs last month' }}
                            icon={<Users className="w-6 h-6" />}
                            color="primary"
                        />
                        <StatsCard
                            title="Documents"
                            value="3,842"
                            change={{ value: -5, label: 'vs last month' }}
                            icon={<FileText className="w-6 h-6" />}
                            color="info"
                        />
                        <StatsCard
                            title="Revenue"
                            value="$48,200"
                            change={{ value: 23, label: 'vs last month' }}
                            icon={<TrendingUp className="w-6 h-6" />}
                            variant="gradient"
                            color="success"
                        />
                        <StatsCard
                            title="Active Sessions"
                            value="842"
                            change={{ value: 8 }}
                            icon={<Zap className="w-6 h-6" />}
                            color="warning"
                            variant="bordered"
                        />
                    </div>
                </section>

                {/* Animated Counters */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Animated Counters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AnimatedCounter
                            value={15847}
                            title="Total Downloads"
                            subtitle="Last 30 days"
                            icon={<Download className="w-6 h-6" />}
                            color="primary"
                        />
                        <AnimatedCounter
                            value={98.5}
                            title="Uptime"
                            suffix="%"
                            icon={<Shield className="w-6 h-6" />}
                            color="success"
                        />
                        <AnimatedCounter
                            value={4250}
                            title="Active Users"
                            prefix="+"
                            icon={<Users className="w-6 h-6" />}
                            color="info"
                        />
                    </div>
                </section>

                {/* Progress Indicators */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Progress Indicators</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Progress value={75} label="Default Progress" showValue color="primary" />
                            <Progress value={60} label="Gradient Style" showValue variant="gradient" color="success" />
                            <Progress value={45} label="Striped & Animated" showValue variant="striped" color="warning" animated />
                            <Progress value={90} label="Glowing Effect" showValue variant="glow" color="info" />
                        </div>
                        <div className="flex items-center justify-center gap-8">
                            <CircularProgress value={75} color="primary" label="Storage" />
                            <CircularProgress value={45} color="warning" label="CPU" size={100} />
                            <CircularProgress value={90} color="success" label="Memory" size={80} />
                        </div>
                    </div>
                </section>

                {/* Sparklines */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Sparklines & Mini Charts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MiniChart
                            data={sparklineData}
                            label="Weekly Sales"
                            value="$12,426"
                            change={{ value: 12 }}
                            color="primary"
                        />
                        <MiniChart
                            data={[20, 15, 25, 30, 22, 18, 28, 35, 30, 40, 38, 45]}
                            label="User Growth"
                            value="2,847"
                            change={{ value: 8 }}
                            color="success"
                        />
                        <MiniChart
                            data={[30, 28, 32, 25, 20, 22, 18, 15, 20, 18, 15, 12]}
                            label="Bounce Rate"
                            value="24.5%"
                            change={{ value: -5 }}
                            color="warning"
                        />
                    </div>
                </section>

                {/* Avatars */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Avatars</h2>
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="space-y-2">
                            <p className="text-sm text-charcoal-500">Sizes</p>
                            <div className="flex items-end gap-2">
                                <Avatar name="John Doe" size="xs" />
                                <Avatar name="Jane Smith" size="sm" />
                                <Avatar name="Bob Wilson" size="md" />
                                <Avatar name="Alice Brown" size="lg" />
                                <Avatar name="Tom Davis" size="xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-charcoal-500">With Status</p>
                            <div className="flex items-center gap-2">
                                <Avatar name="Online User" status="online" />
                                <Avatar name="Away User" status="away" />
                                <Avatar name="Busy User" status="busy" />
                                <Avatar name="Offline User" status="offline" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-charcoal-500">Avatar Group</p>
                            <AvatarGroup
                                avatars={[
                                    { name: 'John Doe' },
                                    { name: 'Jane Smith' },
                                    { name: 'Bob Wilson' },
                                    { name: 'Alice Brown' },
                                    { name: 'Tom Davis' },
                                    { name: 'Sarah Johnson' },
                                ]}
                                max={4}
                            />
                        </div>
                    </div>
                </section>

                {/* Tabs */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Tabs</h2>
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm text-charcoal-500 mb-3">Default Tabs</p>
                            <Tabs items={tabItems} activeTab={activeTab} onChange={setActiveTab} />
                        </div>
                        <div>
                            <p className="text-sm text-charcoal-500 mb-3">Pills Style</p>
                            <Tabs items={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
                        </div>
                        <div>
                            <p className="text-sm text-charcoal-500 mb-3">Underline Style</p>
                            <Tabs items={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
                        </div>
                    </div>
                </section>

                {/* Accordion */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Accordion</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm text-charcoal-500 mb-3">Default</p>
                            <Accordion items={accordionItems} />
                        </div>
                        <div>
                            <p className="text-sm text-charcoal-500 mb-3">Separated Style</p>
                            <Accordion items={accordionItems} variant="separated" allowMultiple />
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Timeline</h2>
                    <Timeline items={timelineItems} />
                </section>

                {/* Tooltips & Popovers */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Tooltips & Popovers</h2>
                    <div className="flex flex-wrap items-center gap-6">
                        <Tooltip content="This is a tooltip!" position="top">
                            <Button variant="secondary">Hover me (top)</Button>
                        </Tooltip>
                        <Tooltip content="Bottom tooltip" position="bottom">
                            <Button variant="secondary">Hover me (bottom)</Button>
                        </Tooltip>
                        <Popover
                            trigger={<Button variant="outline">Click for popover</Button>}
                            content={
                                <div className="w-48">
                                    <h4 className="font-semibold mb-2">Popover Title</h4>
                                    <p className="text-sm text-charcoal-600">This is popover content that appears on click.</p>
                                </div>
                            }
                        />
                    </div>
                </section>

                {/* Dropdowns & Selects */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Dropdowns & Selects</h2>
                    <div className="flex flex-wrap items-start gap-6">
                        <Dropdown
                            trigger={<Button variant="secondary" icon={<Settings className="w-4 h-4" />}>Actions</Button>}
                            items={dropdownItems}
                        />
                        <div className="w-64">
                            <Select
                                label="Select Role"
                                options={selectOptions}
                                value={selectedOption}
                                onChange={setSelectedOption}
                                placeholder="Choose a role..."
                            />
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Quick Action Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickActionCard
                            title="Add User"
                            description="Create a new user account"
                            icon={<Plus className="w-6 h-6" />}
                            color="primary"
                        />
                        <QuickActionCard
                            title="Upload File"
                            description="Upload documents or PDFs"
                            icon={<Upload className="w-6 h-6" />}
                            color="success"
                        />
                        <QuickActionCard
                            title="Send Notification"
                            description="Broadcast to all users"
                            icon={<Bell className="w-6 h-6" />}
                            color="warning"
                        />
                        <QuickActionCard
                            title="Generate Report"
                            description="Create analytics report"
                            icon={<FileText className="w-6 h-6" />}
                            color="info"
                        />
                    </div>
                </section>

                {/* Alerts */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Alerts & Callouts</h2>
                    <div className="space-y-4">
                        <Alert variant="info" title="Information" dismissible>
                            This is an informational message. You can dismiss this alert.
                        </Alert>
                        <Alert variant="success" title="Success!">
                            Your changes have been saved successfully.
                        </Alert>
                        <Alert variant="warning" title="Warning">
                            Please review your settings before continuing.
                        </Alert>
                        <Alert variant="error" title="Error">
                            Something went wrong. Please try again.
                        </Alert>
                        <Callout emoji="💡" title="Pro Tip" variant="primary">
                            You can use these components throughout your application for consistent UI.
                        </Callout>
                    </div>
                </section>

                {/* Code Block */}
                <section className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900">Code Block</h2>
                    <CodeBlock
                        language="typescript"
                        code={`import { Button, Input, Alert } from '@/components/ui';

export default function MyComponent() {
  return (
    <div className="space-y-4">
      <Input label="Email" placeholder="Enter your email" />
      <Button variant="primary">Submit</Button>
      <Alert variant="success">Success!</Alert>
    </div>
  );
}`}
                    />
                </section>

                {/* Empty States */}
                <section className="card-premium p-8 animate-slideUp">
                    <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Empty States</h2>
                    <SearchEmpty 
                        searchTerm="premium components"
                        action={<Button variant="primary" size="sm">Clear Search</Button>}
                    />
                </section>
            </div>
        </div>
    );
}
