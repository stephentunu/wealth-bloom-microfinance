
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
        setLoans(data as Loan[]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const applyForLoan = async (amount: number, purpose: string, interestRate: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      const loanNumber = `LOAN${Date.now()}`;
      const termMonths = 12;
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { error } = await supabase
        .from('loans')
        .insert({
          user_id: userId,
          loan_number: loanNumber,
          principal_amount: amount,
          interest_rate: interestRate / 100,
          term_months: termMonths,
          monthly_payment: monthlyPayment,
          remaining_balance: amount,
          next_payment_date: nextPaymentDate.toISOString().split('T')[0],
          status: 'active',
          approved_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Create loan disbursement transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_type: 'loan',
          transaction_type: 'loan_disbursement',
          amount,
          description: `Loan disbursement - ${purpose}`,
          reference_number: `DISB${Date.now()}`,
          balance_after: amount,
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      }

      await fetchLoans();

      toast({
        title: "Loan approved!",
        description: `Your loan of $${amount.toLocaleString()} has been approved`,
      });
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
