import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useLoans } from '@/hooks/useLoans';
import QuickNavigation from '@/components/QuickNavigation';
import NavigationButtons from '@/components/NavigationButtons';

interface LoanManagementProps {
  userId: string;
  userProfile: any;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  isAdmin?: boolean;
}

const LoanManagement = ({ userId, userProfile, onTabChange, activeTab = 'loans', isAdmin = false }: LoanManagementProps) => {
  const { loans, applyLoan, loading } = useLoans(userId);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [loanType, setLoanType] = useState('');

  const handleApplyLoan = async () => {
    const loanAmount = parseFloat(amount);
    const loanDuration = parseInt(duration);

    if (loanAmount > 0 && loanDuration > 0 && loanType) {
      await applyLoan(loanAmount, loanDuration, loanType);
      setAmount('');
      setDuration('');
      setLoanType('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Apply for loans and manage your existing loans</p>
        </div>
        <div className="flex items-center space-x-4">
          <NavigationButtons 
            onTabChange={onTabChange}
            backButtonLabel="Back to Dashboard"
          />
          <Badge variant="outline" className={userProfile.credit_score >= 700 ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600"}>
            Credit Score: {userProfile.credit_score}
          </Badge>
        </div>
      </div>

      {/* Add Quick Navigation */}
      {onTabChange && (
        <QuickNavigation 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          isAdmin={isAdmin} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply for a Loan</CardTitle>
              <CardDescription>Fill in the details to apply for a new loan</CardDescription>
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
              <div>
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="loanType">Loan Type</Label>
                <Select onValueChange={setLoanType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="business">Business Loan</SelectItem>
                    <SelectItem value="education">Education Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleApplyLoan}
                className="w-full"
                disabled={loading || !amount || !duration || !loanType}
              >
                {loading ? 'Applying...' : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Loans</CardTitle>
              <CardDescription>Manage your existing loans and track payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loans.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No active loans found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{loan.loan_type} Loan</p>
                          <p className="text-sm text-gray-500">
                            Loaned: ${loan.principal_amount.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {loan.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          Remaining Balance: ${loan.remaining_balance.toLocaleString()}
                        </p>
                        <p>
                          Next Payment Date:{' '}
                          {new Date(loan.next_payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
