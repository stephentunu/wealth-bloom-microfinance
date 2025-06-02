
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavingsAccount {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  interest_rate: number;
  interest_earned: number;
  is_active: boolean;
}

interface Transaction {
  id: string;
  account_type: string;
  transaction_type: string;
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
}

export const useSavings = (userId: string | undefined) => {
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchSavingsAccount();
      fetchTransactions();
    }
  }, [userId]);

  const fetchSavingsAccount = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching savings account:', error);
      } else if (data) {
        setSavingsAccount(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('account_type', 'savings')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
      } else if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deposit = async (amount: number) => {
    if (!userId || !savingsAccount) return;

    setLoading(true);
    try {
      const newBalance = savingsAccount.balance + amount;
      const referenceNumber = `DEP${Date.now()}`;

      // Update savings account balance
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({ balance: newBalance })
        .eq('id', savingsAccount.id);

      if (updateError) {
        throw updateError;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_id: savingsAccount.id,
          account_type: 'savings',
          transaction_type: 'deposit',
          amount,
          description: 'Savings deposit',
          reference_number: referenceNumber,
          balance_after: newBalance,
        });

      if (transactionError) {
        throw transactionError;
      }

      // Refresh data
      await fetchSavingsAccount();
      await fetchTransactions();

      toast({
        title: "Deposit successful!",
        description: `$${amount.toLocaleString()} has been added to your savings`,
      });
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: number) => {
    if (!userId || !savingsAccount) return;

    if (amount > savingsAccount.balance) {
      toast({
        title: "Insufficient funds",
        description: "You cannot withdraw more than your current balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newBalance = savingsAccount.balance - amount;
      const referenceNumber = `WTH${Date.now()}`;

      // Update savings account balance
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({ balance: newBalance })
        .eq('id', savingsAccount.id);

      if (updateError) {
        throw updateError;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_id: savingsAccount.id,
          account_type: 'savings',
          transaction_type: 'withdrawal',
          amount,
          description: 'Savings withdrawal',
          reference_number: referenceNumber,
          balance_after: newBalance,
        });

      if (transactionError) {
        throw transactionError;
      }

      // Refresh data
      await fetchSavingsAccount();
      await fetchTransactions();

      toast({
        title: "Withdrawal successful!",
        description: `$${amount.toLocaleString()} has been withdrawn from your savings`,
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    savingsAccount,
    transactions,
    loading,
    deposit,
    withdraw,
    refresh: () => {
      fetchSavingsAccount();
      fetchTransactions();
    },
  };
};
