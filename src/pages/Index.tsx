
import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import SavingsAccount from '@/components/SavingsAccount';
import LoanManagement from '@/components/LoanManagement';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, userProfile, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <AuthForm />;
  }

  const handleLogout = () => {
    signOut();
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'savings':
        return <SavingsAccount userId={user.id} onTabChange={setActiveTab} />;
      case 'loans':
        return <LoanManagement userId={user.id} userProfile={userProfile} onTabChange={setActiveTab} />;
      case 'admin':
        return isAdmin ? <AdminDashboard onTabChange={setActiveTab} /> : <Dashboard userId={user.id} userProfile={userProfile} onTabChange={setActiveTab} />;
      default:
        return <Dashboard userId={user.id} userProfile={userProfile} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={userProfile}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
