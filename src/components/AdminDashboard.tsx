
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useAdminLoans } from '@/hooks/useAdminLoans';
import QuickNavigation from '@/components/QuickNavigation';
import NavigationButtons from '@/components/NavigationButtons';

interface AdminDashboardProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  isAdmin?: boolean;
}

const AdminDashboard = ({ onTabChange, activeTab = 'admin', isAdmin = false }: AdminDashboardProps) => {
  const { loans, loading, approveLoan, rejectLoan } = useAdminLoans();
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'active' || loan.status === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');

  const handleRejectLoan = async () => {
    if (rejectingLoanId && rejectionReason.trim()) {
      await rejectLoan(rejectingLoanId, rejectionReason);
      setRejectingLoanId(null);
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
      case 'approved':
        return <Badge variant="default" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'paid_off':
        return <Badge variant="secondary" className="text-blue-600">Paid Off</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, loans, and system settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <NavigationButtons 
            onTabChange={onTabChange}
            backButtonLabel="Back to Dashboard"
          />
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            Administrator Access
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedLoans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Loans</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedLoans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${approvedLoans.reduce((sum, loan) => sum + loan.principal_amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Loans Section */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Loan Applications</CardTitle>
            <CardDescription>Review and approve or reject loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLoans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {loan.user_profiles.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{loan.user_profiles.email}</p>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-medium">${loan.principal_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">${loan.monthly_payment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Score</p>
                      <p className="font-medium">{loan.user_profiles.credit_score}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{(loan.interest_rate * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => approveLoan(loan.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={loading}
                          onClick={() => setRejectingLoanId(loan.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Loan Application</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting this loan application.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Input
                              id="rejection-reason"
                              placeholder="e.g., Insufficient credit score, High debt-to-income ratio"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={handleRejectLoan}
                            disabled={!rejectionReason.trim() || loading}
                          >
                            Reject Loan
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loan Applications</CardTitle>
          <CardDescription>Complete history of loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Loan #{loan.loan_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {loan.user_profiles.full_name} - Applied: {new Date(loan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Principal Amount</p>
                    <p className="font-medium">${loan.principal_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Credit Score</p>
                    <p className="font-medium">{loan.user_profiles.credit_score}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{(loan.interest_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining Balance</p>
                    <p className="font-medium">${loan.remaining_balance.toLocaleString()}</p>
                  </div>
                </div>

                {loan.rejection_reason && (
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
    </div>
  );
};

export default AdminDashboard;
