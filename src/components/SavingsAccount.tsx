import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, TrendingUp } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import QuickNavigation from '@/components/QuickNavigation';

interface SavingsAccountProps {
  userId: string;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  isAdmin?: boolean;
}

const SavingsAccount = ({ userId, onTabChange, activeTab = 'savings', isAdmin = false }: SavingsAccountProps) => {
  const { savingsAccount, transactions, loading, deposit, withdraw } = useSavings(userId);
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      await deposit(depositAmount);
      setAmount('');
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0) {
      await withdraw(withdrawAmount);
      setAmount('');
    }
  };

  if (!savingsAccount) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Setting up your savings account...</h2>
          <p className="text-gray-600 mt-2">Please wait while we initialize your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Account</h1>
          <p className="text-gray-600">Manage your savings and earn interest</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          {(savingsAccount.interest_rate * 100).toFixed(1)}% APY
        </Badge>
      </div>

      {/* Add Quick Navigation */}
      {onTabChange && (
        <QuickNavigation 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          isAdmin={isAdmin} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Account Balance</span>
              </CardTitle>
              <CardDescription>
                Account Number: {savingsAccount.account_number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${savingsAccount.balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Interest earned: ${savingsAccount.interest_earned.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent savings transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Balance: ${transaction.balance_after?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions yet. Make your first deposit!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Deposit or withdraw funds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleDeposit}
                  className="w-full"
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Deposit'}
                </Button>
                
                <Button
                  onClick={handleWithdraw}
                  variant="outline"
                  className="w-full"
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Withdraw'}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground mt-4">
                <p>• Minimum deposit: $10</p>
                <p>• Interest calculated daily</p>
                <p>• No fees for deposits</p>
                <p>• Withdrawals processed instantly</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SavingsAccount;
