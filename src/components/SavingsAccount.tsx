
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, TrendingUp } from 'lucide-react';

interface SavingsAccountProps {
  savingsData: any;
  onUpdateSavings: (newData: any) => void;
}

const SavingsAccount = ({ savingsData, onUpdateSavings }: SavingsAccountProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newTransaction = {
        id: Date.now(),
        type: 'deposit',
        amount: depositAmount,
        description: 'Savings deposit',
        date: new Date().toLocaleDateString(),
        balance: savingsData.balance + depositAmount,
      };

      const updatedSavings = {
        ...savingsData,
        balance: savingsData.balance + depositAmount,
        transactions: [newTransaction, ...savingsData.transactions],
      };

      onUpdateSavings(updatedSavings);
      setAmount('');
      setIsLoading(false);
      
      toast({
        title: "Deposit successful!",
        description: `$${depositAmount.toLocaleString()} has been added to your savings`,
      });
    }, 1000);
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > savingsData.balance) {
      toast({
        title: "Insufficient funds",
        description: "You cannot withdraw more than your current balance",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newTransaction = {
        id: Date.now(),
        type: 'withdrawal',
        amount: withdrawAmount,
        description: 'Savings withdrawal',
        date: new Date().toLocaleDateString(),
        balance: savingsData.balance - withdrawAmount,
      };

      const updatedSavings = {
        ...savingsData,
        balance: savingsData.balance - withdrawAmount,
        transactions: [newTransaction, ...savingsData.transactions],
      };

      onUpdateSavings(updatedSavings);
      setAmount('');
      setIsLoading(false);
      
      toast({
        title: "Withdrawal successful!",
        description: `$${withdrawAmount.toLocaleString()} has been withdrawn from your savings`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Account</h1>
          <p className="text-gray-600">Manage your savings and earn interest</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          3.5% APY
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Account Balance</span>
              </CardTitle>
              <CardDescription>Your current savings balance and interest earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${savingsData.balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Interest earned this month: ${savingsData.interestEarned.toFixed(2)}
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
                {savingsData.transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Balance: ${transaction.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {savingsData.transactions.length === 0 && (
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
                  disabled={isLoading || !amount}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                
                <Button
                  onClick={handleWithdraw}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || !amount}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Withdraw
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
