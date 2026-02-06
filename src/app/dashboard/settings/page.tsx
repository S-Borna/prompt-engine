'use client';

import { useState } from 'react';
import {
    Settings, User, Bell, Shield, Globe,
    ChevronRight, Check, Moon, Sun, Monitor, Save, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS - Account & Preferences
// Dark theme unified with landing page - All inputs working
// ═══════════════════════════════════════════════════════════════════════════

const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('dark');

    // Profile state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');

    // Notifications state
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true,
        tips: true,
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'appearance', name: 'Appearance', icon: Moon },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'language', name: 'Language', icon: Globe },
    ];

    const handleSaveProfile = () => {
        toast.success('Profile saved (demo mode)');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">Settings</h1>
                <p className="text-white/40 text-sm">Manage your account and preferences</p>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-56 flex-shrink-0 hidden md:block">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-white/[0.08] text-white'
                                    : 'hover:bg-white/[0.04] text-white/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.05] p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>

                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <button
                                        onClick={() => toast('Avatar upload coming soon', { icon: '📷' })}
                                        className="px-4 py-2 text-sm text-white/60 border border-white/[0.1] font-medium rounded-lg hover:bg-white/[0.04] transition-colors"
                                    >
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-white/30 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-2">Bio</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03] transition-all resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/15 hover:shadow-xl hover:shadow-violet-500/20 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>

                            <div className="space-y-4">
                                {[
                                    { key: 'email', title: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'push', title: 'Push Notifications', desc: 'Browser push notifications' },
                                    { key: 'updates', title: 'Product Updates', desc: 'New features and improvements' },
                                    { key: 'tips', title: 'Tips & Tutorials', desc: 'Helpful prompting tips' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <h3 className="font-medium text-white">{item.title}</h3>
                                            <p className="text-sm text-white/50">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                            className={`w-14 h-8 rounded-full transition-all ${notifications[item.key as keyof typeof notifications]
                                                ? 'bg-violet-500'
                                                : 'bg-white/20'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Appearance</h2>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-3">Theme</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-4 rounded-xl border-2 transition-all ${theme === t.id
                                                ? 'border-violet-500 bg-violet-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <t.icon className="w-5 h-5 text-white/80" />
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="font-medium text-white">{t.name}</span>
                                                {theme === t.id && <Check className="w-4 h-4 text-violet-400" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <Info className="w-4 h-4" />
                                <span>Theme settings will be applied in a future update</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Security</h2>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white/60" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                                        <p className="text-sm text-white/50">Not available in demo mode</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <Info className="w-4 h-4" />
                                <span>Security features require a production database</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'language' && (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Language & Region</h2>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Interface Language</label>
                                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <Info className="w-4 h-4" />
                                <span>Additional languages coming soon</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
