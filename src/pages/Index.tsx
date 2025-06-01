
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import SavingsAccount from '@/components/SavingsAccount';
import LoanManagement from '@/components/LoanManagement';

const Index = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [savingsData, setSavingsData] = useState({
    balance: 0,
    interestEarned: 0,
    transactions: [],
  });
  const [loansData, setLoansData] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('microfinance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedSavings = localStorage.getItem('microfinance_savings');
    if (savedSavings) {
      setSavingsData(JSON.parse(savedSavings));
    }

    const savedLoans = localStorage.getItem('microfinance_loans');
    if (savedLoans) {
      setLoansData(JSON.parse(savedLoans));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('microfinance_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('microfinance_savings', JSON.stringify(savingsData));
  }, [savingsData]);

  useEffect(() => {
    localStorage.setItem('microfinance_loans', JSON.stringify(loansData));
  }, [loansData]);

  const handleAuth = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    localStorage.removeItem('microfinance_user');
  };

  const handleUpdateSavings = (newSavingsData: any) => {
    setSavingsData(newSavingsData);
  };

  const handleUpdateLoans = (newLoansData: any) => {
    setLoansData(newLoansData);
  };

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'savings':
        return (
          <SavingsAccount
            savingsData={savingsData}
            onUpdateSavings={handleUpdateSavings}
          />
        );
      case 'loans':
        return (
          <LoanManagement
            user={user}
            savingsData={savingsData}
            loansData={loansData}
            onUpdateLoans={handleUpdateLoans}
          />
        );
      default:
        return (
          <Dashboard
            user={user}
            savingsData={savingsData}
            loansData={loansData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
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
