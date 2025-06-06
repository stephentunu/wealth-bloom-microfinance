import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminLoans } from '@/hooks/useAdminLoans';
import { useAuth } from '@/hooks/useAuth';
import NavigationButtons from '@/components/NavigationButtons';
import { Check, X, AlertTriangle, Users, CreditCard, DollarSign } from 'lucide-react';
import FraudDetectionPanel from '@/components/FraudDetectionPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { loans, loading, approveLoan, rejectLoan } = useAdminLoans();
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [loanToReject, setLoanToReject] = useState<string | null>(null);

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const completedLoans = loans.filter(loan => loan.status === 'paid_off');

  const handleRejectLoan = (loanId: string) => {
    setLoanToReject(loanId);
  };

  const confirmRejectLoan = async () => {
    if (loanToReject && rejectionReason) {
      await rejectLoan(loanToReject, rejectionReason);
      setLoanToReject(null);
      setRejectionReason('');
    }
  };

  const cancelRejectLoan = () => {
    setLoanToReject(null);
    setRejectionReason('');
  };

  const handleHome = () => {
    // Navigate to home
  };

  return (
    <div className="space-y-6">
      <NavigationButtons 
        onHome={handleHome}
        showBack={false}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage loans, users, and system settings</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Admin Access
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loan Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Loans</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingLoans.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Loans</p>
                    <p className="text-3xl font-bold text-blue-600">{activeLoans.length}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
                    <p className="text-3xl font-bold text-green-600">
                      KSh {activeLoans.reduce((sum, loan) => sum + loan.principal_amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Activity feed coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Pending Loan Applications</CardTitle>
              <CardDescription>Review and approve loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading loans...</p>
              ) : pendingLoans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending loan applications</p>
              ) : (
                <div className="space-y-4">
                  {pendingLoans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{loan.user_profiles.full_name}</p>
                          <p className="text-sm text-gray-600">{loan.user_profiles.email}</p>
                          <div className="mt-2">
                            <p className="text-sm">
                              <span className="font-medium">Amount:</span> KSh {loan.principal_amount.toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Term:</span> {loan.term_months} months
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Interest Rate:</span> {(loan.interest_rate * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Credit Score:</span> {loan.user_profiles.credit_score}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Applied:</span> {new Date(loan.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => approveLoan(loan.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectLoan(loan.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loanToReject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <h3 className="text-lg font-medium mb-4">Reject Loan Application</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please provide a reason for rejecting this loan application.
                    </p>
                    <textarea
                      className="w-full border rounded-md p-2 mb-4"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={cancelRejectLoan}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={confirmRejectLoan}
                        disabled={!rejectionReason}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Currently active loans in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading loans...</p>
              ) : activeLoans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active loans</p>
              ) : (
                <div className="space-y-2">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{loan.user_profiles.full_name}</p>
                        <p className="text-sm text-gray-600">
                          KSh {loan.principal_amount.toLocaleString()} • {(loan.interest_rate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Balance: KSh {loan.remaining_balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Next payment: {new Date(loan.next_payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">User management coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <FraudDetectionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
