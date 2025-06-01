
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { useLoans } from '@/hooks/useLoans';

interface DashboardProps {
  userId: string;
  userProfile: any;
}

const Dashboard = ({ userId, userProfile }: DashboardProps) => {
  const { savingsAccount, transactions } = useSavings(userId);
  const { loans } = useLoans(userId);

  const totalLoaned = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
  const totalOwed = loans.reduce((sum, loan) => sum + loan.remaining_balance, 0);
  const creditUtilization = savingsAccount?.balance ? (totalOwed / savingsAccount.balance) * 100 : 0;
  const loanCapacity = savingsAccount ? Math.max(0, savingsAccount.balance * 0.8 - totalOwed) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.full_name}!</h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>
        <Badge variant="outline" className={userProfile.is_verified ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600"}>
          {userProfile.is_verified ? 'Account Verified' : 'Pending Verification'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${savingsAccount?.balance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +${savingsAccount?.interest_earned?.toFixed(2) || '0.00'} interest earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userProfile.credit_score}</div>
            <p className="text-xs text-muted-foreground">
              {userProfile.credit_score >= 700 ? 'Excellent' : userProfile.credit_score >= 650 ? 'Good' : 'Fair'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{loans.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              ${totalOwed.toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Capacity</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${loanCapacity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available to borrow</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Utilization</CardTitle>
            <CardDescription>
              Your loan-to-savings ratio (recommended: below 60%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={creditUtilization} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span className={creditUtilization > 60 ? 'text-red-600' : 'text-green-600'}>
                  {creditUtilization.toFixed(1)}%
                </span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet. Start by making a deposit!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
