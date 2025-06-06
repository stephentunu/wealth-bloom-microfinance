import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Loan {
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
}

export const useLoans = (userId: string | undefined) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchLoans();
    }
  }, [userId]);

  const fetchLoans = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
      } else if (data) {
        setLoans(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const applyForLoan = async (amount: number, purpose: string, interestRate: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      // First, get the user's savings balance
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('balance')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (savingsError) {
        console.error('Error fetching savings balance:', savingsError);
        throw new Error('Unable to verify savings balance');
      }

      const savingsBalance = savingsData?.balance || 0;
      
      // Determine if loan should be auto-approved
      const isAutoApproved = amount <= savingsBalance;
      const loanStatus = isAutoApproved ? 'active' : 'pending';
      
      const loanNumber = `LOAN${Date.now()}`;
      const termMonths = 12;
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const loanData = {
        user_id: userId,
        loan_number: loanNumber,
        principal_amount: amount,
        interest_rate: interestRate / 100,
        term_months: termMonths,
        monthly_payment: monthlyPayment,
        remaining_balance: amount,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        status: loanStatus,
        ...(isAutoApproved ? {
          approved_at: new Date().toISOString(),
          approval_date: new Date().toISOString(),
        } : {})
      };

      const { error } = await supabase
        .from('loans')
        .insert(loanData);

      if (error) {
        throw error;
      }

      await fetchLoans();

      if (isAutoApproved) {
        toast({
          title: "Loan approved automatically!",
          description: `Your loan application for $${amount.toLocaleString()} has been approved and is now active`,
        });
      } else {
        toast({
          title: "Loan application submitted!",
          description: `Your loan application for $${amount.toLocaleString()} exceeds your savings balance and requires admin approval`,
        });
      }
    } catch (error) {
      console.error('Loan application error:', error);
      toast({
        title: "Loan application failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async (loanId: string, paymentAmount: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      const newRemainingBalance = Math.max(0, loan.remaining_balance - paymentAmount);
      const newStatus = newRemainingBalance === 0 ? 'paid_off' : 'active';

      // Update loan
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          remaining_balance: newRemainingBalance,
          status: newStatus,
        })
        .eq('id', loanId);

      if (updateError) {
        throw updateError;
      }

      // Create payment transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_id: loanId,
          account_type: 'loan',
          transaction_type: 'loan_payment',
          amount: paymentAmount,
          description: 'Loan payment',
          reference_number: `PAY${Date.now()}`,
          balance_after: newRemainingBalance,
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      }

      await fetchLoans();

      toast({
        title: "Payment successful!",
        description: `Payment of $${paymentAmount.toLocaleString()} has been processed`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
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
    applyForLoan,
    makePayment,
    refresh: fetchLoans,
  };
};
