
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FraudAlert {
  id: string;
  user_id: string;
  transaction_id: string;
  fraud_type: string;
  risk_score: number;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

interface FraudRule {
  type: string;
  description: string;
  riskScore: number;
}

export const useFraudDetection = () => {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fraudRules: FraudRule[] = [
    { type: 'HIGH_FREQUENCY', description: 'Multiple transactions in short time', riskScore: 80 },
    { type: 'LARGE_AMOUNT', description: 'Transaction amount unusually high', riskScore: 70 },
    { type: 'UNUSUAL_PATTERN', description: 'Transaction pattern deviation', riskScore: 60 },
    { type: 'MULTIPLE_WITHDRAWALS', description: 'Multiple withdrawals in succession', riskScore: 75 },
    { type: 'VELOCITY_CHECK', description: 'Transaction velocity exceeds threshold', riskScore: 85 }
  ];

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const fetchFraudAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fraud alerts:', error);
      } else if (data) {
        setFraudAlerts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTransaction = async (
    userId: string,
    transactionType: string,
    amount: number,
    accountType: string
  ): Promise<{ isFraudulent: boolean; riskScore: number; reasons: string[] }> => {
    const reasons: string[] = [];
    let totalRiskScore = 0;

    try {
      // Get user's recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Get user's savings balance for context
      const { data: savingsData } = await supabase
        .from('savings_accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();

      const userBalance = savingsData?.balance || 0;
      const recentTxns = recentTransactions || [];

      // Rule 1: High frequency transactions (more than 5 in last hour)
      const lastHourTxns = recentTxns.filter(
        txn => new Date(txn.created_at) > new Date(Date.now() - 60 * 60 * 1000)
      );
      
      if (lastHourTxns.length >= 5) {
        reasons.push('High frequency transactions detected');
        totalRiskScore += 80;
      }

      // Rule 2: Large amount relative to balance
      if (amount > userBalance * 0.8 && transactionType === 'withdrawal') {
        reasons.push('Large withdrawal relative to balance');
        totalRiskScore += 70;
      }

      // Rule 3: Multiple withdrawals in succession
      const recentWithdrawals = recentTxns
        .filter(txn => txn.transaction_type === 'withdrawal')
        .slice(0, 3);
      
      if (recentWithdrawals.length >= 3 && transactionType === 'withdrawal') {
        reasons.push('Multiple consecutive withdrawals');
        totalRiskScore += 75;
      }

      // Rule 4: Unusual transaction amount (very high)
      if (amount > 100000) { // KSh 100,000
        reasons.push('Unusually high transaction amount');
        totalRiskScore += 60;
      }

      // Rule 5: Velocity check - total amount in last 24 hours
      const totalLast24h = recentTxns
        .filter(txn => txn.transaction_type === 'withdrawal')
        .reduce((sum, txn) => sum + Number(txn.amount), 0);
      
      if (totalLast24h + amount > userBalance * 1.5) {
        reasons.push('Total withdrawal velocity exceeds threshold');
        totalRiskScore += 85;
      }

      // Cap risk score at 100
      totalRiskScore = Math.min(totalRiskScore, 100);

      return {
        isFraudulent: totalRiskScore >= 60,
        riskScore: totalRiskScore,
        reasons
      };

    } catch (error) {
      console.error('Error analyzing transaction:', error);
      return { isFraudulent: false, riskScore: 0, reasons: [] };
    }
  };

  const createFraudAlert = async (
    userId: string,
    transactionId: string,
    fraudType: string,
    riskScore: number,
    details: string
  ) => {
    try {
      const { error } = await supabase
        .from('fraud_alerts')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          fraud_type: fraudType,
          risk_score: riskScore,
          details,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating fraud alert:', error);
      } else {
        await fetchFraudAlerts();
        
        toast({
          title: "Fraud Alert Created",
          description: `High-risk transaction flagged for review (Risk Score: ${riskScore})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateAlertStatus = async (alertId: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ status })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert status:', error);
      } else {
        await fetchFraudAlerts();
        toast({
          title: "Alert Updated",
          description: `Alert marked as ${status}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    fraudAlerts,
    loading,
    fraudRules,
    analyzeTransaction,
    createFraudAlert,
    updateAlertStatus,
    refresh: fetchFraudAlerts,
  };
};
