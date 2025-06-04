
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanWithUser {
  id: string;
  user_id: string;
  loan_number: string;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  remaining_balance: number;
  next_payment_date: string;
  status: string;
  approved_at: string;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
    credit_score: number;
  } | null;
}

export const useAdminLoans = () => {
  const [loans, setLoans] = useState<LoanWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          user_profiles (
            full_name,
            email,
            credit_score
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        toast({
          title: "Error",
          description: "Failed to fetch loans",
          variant: "destructive",
        });
      } else if (data) {
        // Filter out loans without user profiles
        const validLoans = data.filter(loan => loan.user_profiles !== null) as LoanWithUser[];
        setLoans(validLoans);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveLoan = async (loanId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const loan = loans.find(l => l.id === loanId);
      if (!loan) throw new Error('Loan not found');

      // Update loan status to approved
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'active',
          approved_by: user.id,
          approval_date: new Date().toISOString(),
        })
        .eq('id', loanId);

      if (updateError) throw updateError;

      // Create loan disbursement transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: loan.user_id,
          account_type: 'loan',
          transaction_type: 'loan_disbursement',
          amount: loan.principal_amount,
          description: `Loan disbursement - ${loan.loan_number}`,
          reference_number: `DISB${Date.now()}`,
          balance_after: loan.principal_amount,
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      }

      await fetchLoans();

      toast({
        title: "Loan approved!",
        description: `Loan ${loan.loan_number} has been approved and disbursed`,
      });
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Approval failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectLoan = async (loanId: string, reason: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('loans')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approval_date: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', loanId);

      if (error) throw error;

      await fetchLoans();

      toast({
        title: "Loan rejected",
        description: `Loan has been rejected with reason: ${reason}`,
      });
    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: "Rejection failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loans,
    loading,
    approveLoan,
    rejectLoan,
    refresh: fetchLoans,
  };
};
