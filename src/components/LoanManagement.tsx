
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface LoanManagementProps {
  user: any;
  savingsData: any;
  loansData: any[];
  onUpdateLoans: (newLoans: any[]) => void;
}

const LoanManagement = ({ user, savingsData, loansData, onUpdateLoans }: LoanManagementProps) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const maxLoanAmount = Math.max(0, savingsData.balance * 0.8 - loansData.reduce((sum, loan) => sum + loan.remainingAmount, 0));
  const interestRate = user.creditScore >= 700 ? 8.5 : user.creditScore >= 650 ? 12.0 : 15.5;

  const calculateLoanDetails = (amount: number) => {
    const monthlyRate = interestRate / 100 / 12;
    const months = 12; // 1 year term
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = monthlyPayment * months;
    
    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: (totalAmount - amount).toFixed(2),
    };
  };

  const handleApplyLoan = async () => {
    const amount = parseFloat(loanAmount);
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid loan amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > maxLoanAmount) {
      toast({
        title: "Loan amount too high",
        description: `Maximum loan amount is $${maxLoanAmount.toLocaleString()} based on your savings`,
        variant: "destructive",
      });
      return;
    }

    if (!loanPurpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please specify the purpose of your loan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const loanDetails = calculateLoanDetails(amount);
      const newLoan = {
        id: Date.now(),
        amount,
        remainingAmount: amount,
        purpose: loanPurpose,
        interestRate,
        monthlyPayment: parseFloat(loanDetails.monthlyPayment),
        totalAmount: parseFloat(loanDetails.totalAmount),
        appliedDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'active',
        paymentsRemaining: 12,
        paymentHistory: [],
      };

      const updatedLoans = [...loansData, newLoan];
      onUpdateLoans(updatedLoans);

      setLoanAmount('');
      setLoanPurpose('');
      setIsLoading(false);

      toast({
        title: "Loan approved!",
        description: `Your loan of $${amount.toLocaleString()} has been approved`,
      });
    }, 2000);
  };

  const handleLoanPayment = (loanId: number, paymentAmount: number) => {
    const updatedLoans = loansData.map(loan => {
      if (loan.id === loanId) {
        const newRemainingAmount = Math.max(0, loan.remainingAmount - paymentAmount);
        const newPaymentsRemaining = Math.max(0, loan.paymentsRemaining - 1);
        
        return {
          ...loan,
          remainingAmount: newRemainingAmount,
          paymentsRemaining: newPaymentsRemaining,
          status: newRemainingAmount === 0 ? 'paid' : 'active',
          paymentHistory: [
            ...loan.paymentHistory,
            {
              date: new Date().toLocaleDateString(),
              amount: paymentAmount,
              remainingBalance: newRemainingAmount,
            }
          ],
        };
      }
      return loan;
    });

    onUpdateLoans(updatedLoans);
    
    toast({
      title: "Payment successful!",
      description: `Payment of $${paymentAmount.toLocaleString()} has been processed`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Apply for loans and manage your repayments</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          {interestRate}% APR
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loansData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Active Loans</CardTitle>
                <CardDescription>Track your loan repayments and balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loansData.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{loan.purpose}</h3>
                          <p className="text-sm text-muted-foreground">Applied: {loan.appliedDate}</p>
                        </div>
                        <Badge variant={loan.status === 'paid' ? 'secondary' : 'default'}>
                          {loan.status === 'paid' ? 'Paid Off' : 'Active'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Original Amount</p>
                          <p className="font-medium">${loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-medium text-orange-600">${loan.remainingAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">${loan.monthlyPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payments Left</p>
                          <p className="font-medium">{loan.paymentsRemaining}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{((loan.amount - loan.remainingAmount) / loan.amount * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(loan.amount - loan.remainingAmount) / loan.amount * 100} />
                      </div>

                      {loan.status === 'active' && (
                        <Button
                          onClick={() => handleLoanPayment(loan.id, loan.monthlyPayment)}
                          size="sm"
                          className="w-full"
                        >
                          Make Payment (${loan.monthlyPayment.toLocaleString()})
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Loan Eligibility</CardTitle>
              <CardDescription>Based on your savings and credit score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${maxLoanAmount.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Maximum Loan Amount</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{interestRate}%</div>
                  <p className="text-sm text-muted-foreground">Your Interest Rate</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {user.creditScore >= 650 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Credit Score: {user.creditScore}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {savingsData.balance >= 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Savings Balance: ${savingsData.balance.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Apply for Loan</span>
              </CardTitle>
              <CardDescription>Calculate and apply for a new loan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loan-amount">Loan Amount ($)</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  max={maxLoanAmount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: ${maxLoanAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="loan-purpose">Purpose</Label>
                <Input
                  id="loan-purpose"
                  placeholder="e.g., Business expansion, Education"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                />
              </div>

              {loanAmount && parseFloat(loanAmount) > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Loan Preview</h4>
                  {(() => {
                    const details = calculateLoanDetails(parseFloat(loanAmount));
                    return (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Monthly Payment:</span>
                          <span className="font-medium">${details.monthlyPayment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">${details.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Interest:</span>
                          <span className="font-medium">${details.totalInterest}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span className="font-medium">12 months</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <Button
                onClick={handleApplyLoan}
                className="w-full"
                disabled={isLoading || !loanAmount || !loanPurpose || parseFloat(loanAmount) > maxLoanAmount}
              >
                {isLoading ? 'Processing...' : 'Apply for Loan'}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Loan approval is instant</p>
                <p>• 12-month repayment term</p>
                <p>• No prepayment penalties</p>
                <p>• Rate based on credit score</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
