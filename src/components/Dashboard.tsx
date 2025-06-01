
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface DashboardProps {
  user: any;
  savingsData: any;
  loansData: any[];
}

const Dashboard = ({ user, savingsData, loansData }: DashboardProps) => {
  const totalLoaned = loansData.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOwed = loansData.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const creditUtilization = savingsData.balance > 0 ? (totalOwed / savingsData.balance) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Account Verified
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
              ${savingsData.balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +${savingsData.interestEarned.toFixed(2)} interest earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{user.creditScore}</div>
            <p className="text-xs text-muted-foreground">
              {user.creditScore >= 700 ? 'Excellent' : user.creditScore >= 650 ? 'Good' : 'Fair'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{loansData.length}</div>
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
              ${Math.max(0, savingsData.balance * 0.8 - totalOwed).toLocaleString()}
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
              {savingsData.transactions.slice(0, 3).map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
