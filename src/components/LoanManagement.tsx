import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { useLoans } from '@/hooks/useLoans';
import { useSavings } from '@/hooks/useSavings';
import NavigationButtons from '@/components/NavigationButtons';

interface LoanManagementProps {
  userId: string;
  userProfile: any;
  onTabChange?: (tab: string) => void;
}

const LoanManagement = ({ userId, userProfile, onTabChange }: LoanManagementProps) => {
  const { loans, loading, applyForLoan, makePayment } = useLoans(userId);
  const { savingsAccount } = useSavings(userId);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');

  const handleHome = () => {
    if (onTabChange) onTabChange('dashboard');
  };

  const handleBack = () => {
    if (onTabChange) onTabChange('dashboard');
  };

  // Calculate loan eligibility based on credit score and savings
  const calculateEligibility = () => {
    if (!userProfile || !savingsAccount) return null;
    
    const creditScore = userProfile.credit_score || 0;
    const savingsBalance = savingsAccount.balance || 0;
    
    // Simple eligibility calculation
    let maxLoanAmount = 0;
    let recommendedRate = 0.15; // 15% default rate
    
    if (creditScore >= 750) {
      maxLoanAmount = savingsBalance * 5;
      recommendedRate = 0.08; // 8% for excellent credit
    } else if (creditScore >= 700) {
      maxLoanAmount = savingsBalance * 4;
      recommendedRate = 0.10; // 10% for good credit
    } else if (creditScore >= 650) {
      maxLoanAmount = savingsBalance * 3;
      recommendedRate = 0.12; // 12% for fair credit
    } else if (creditScore >= 600) {
      maxLoanAmount = savingsBalance * 2;
      recommendedRate = 0.15; // 15% for poor credit
    } else {
      maxLoanAmount = savingsBalance * 1;
      recommendedRate = 0.18; // 18% for very poor credit
    }
    
    return {
      max_loan_amount: Math.max(maxLoanAmount, 100), // Minimum $100
      recommended_rate: recommendedRate
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-yellow-600">Pending Approval</Badge>;
      case 'approved':
      case 'active':
        return <Badge variant="default" className="text-green-600">Active</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'paid_off':
        return <Badge variant="secondary" className="text-blue-600">Paid Off</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const eligibility = calculateEligibility();

  const calculateLoanDetails = (amount: number) => {
    if (!eligibility) return null;
    
    const monthlyRate = eligibility.recommended_rate / 12;
    const months = 12;
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
    if (!eligibility || amount <= 0 || amount > eligibility.max_loan_amount || !loanPurpose.trim()) {
      return;
    }

    const interestRate = eligibility.recommended_rate * 100;
    await applyForLoan(amount, loanPurpose, interestRate);
    setLoanAmount('');
    setLoanPurpose('');
  };

  const handleLoanPayment = async (loanId: string, paymentAmount: number) => {
    await makePayment(loanId, paymentAmount);
  };

  if (!eligibility) {
    return (
      <div className="space-y-6">
        <NavigationButtons 
          onHome={handleHome}
          onBack={handleBack}
        />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Loading loan information...</h2>
          <p className="text-gray-600 mt-2">Please wait while we calculate your eligibility.</p>
        </div>
      </div>
    );
  }

  const interestRatePercent = (eligibility.recommended_rate * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <NavigationButtons 
        onHome={handleHome}
        onBack={handleBack}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Apply for loans and manage your repayments</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          {interestRatePercent}% APR
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Loans</CardTitle>
                <CardDescription>Track your loan applications and repayments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Loan #{loan.loan_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied: {new Date(loan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(loan.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Principal Amount</p>
                          <p className="font-medium">${loan.principal_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-medium text-orange-600">${loan.remaining_balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">${loan.monthly_payment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">{(loan.interest_rate * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      {loan.status === 'active' && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{((loan.principal_amount - loan.remaining_balance) / loan.principal_amount * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(loan.principal_amount - loan.remaining_balance) / loan.principal_amount * 100} />
                          </div>

                          <Button
                            onClick={() => handleLoanPayment(loan.id, loan.monthly_payment)}
                            size="sm"
                            className="w-full"
                            disabled={loading}
                          >
                            Make Payment (${loan.monthly_payment.toLocaleString()})
                          </Button>
                        </>
                      )}

                      {loan.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-sm text-yellow-800">
                            Your loan application is pending admin approval. You will be notified once it's reviewed.
                          </p>
                        </div>
                      )}

                      {loan.status === 'rejected' && loan.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {loan.rejection_reason}
                          </p>
                        </div>
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
                  <div className="text-2xl font-bold text-green-600">
                    ${eligibility.max_loan_amount?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Maximum Loan Amount</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{interestRatePercent}%</div>
                  <p className="text-sm text-muted-foreground">Your Interest Rate</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {userProfile.credit_score >= 650 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">Credit Score: {userProfile.credit_score}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {savingsAccount && savingsAccount.balance >= 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    Savings Balance: ${savingsAccount?.balance?.toLocaleString() || '0'}
                  </span>
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
                  max={eligibility.max_loan_amount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: ${eligibility.max_loan_amount?.toLocaleString() || '0'}
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
                    if (!details) return null;
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
                disabled={
                  loading || 
                  !loanAmount || 
                  !loanPurpose || 
                  parseFloat(loanAmount) > (eligibility.max_loan_amount || 0) ||
                  parseFloat(loanAmount) <= 0
                }
              >
                {loading ? 'Processing...' : 'Apply for Loan'}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Loan applications require admin approval</p>
                <p>• You will be notified of the decision</p>
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
