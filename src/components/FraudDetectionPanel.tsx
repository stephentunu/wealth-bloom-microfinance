
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, CheckCircle } from 'lucide-react';
import { useFraudDetection } from '@/hooks/useFraudDetection';

const FraudDetectionPanel = () => {
  const { fraudAlerts, loading, updateAlertStatus } = useFraudDetection();

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore >= 80) return 'bg-red-600 text-white';
    if (riskScore >= 60) return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-black';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) return 'Critical';
    if (riskScore >= 60) return 'High';
    return 'Medium';
  };

  const pendingAlerts = fraudAlerts.filter(alert => alert.status === 'pending');
  const reviewedAlerts = fraudAlerts.filter(alert => alert.status !== 'pending');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading fraud detection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
          <p className="text-gray-600">Monitor and manage fraudulent transaction alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-green-600" />
          <span className="text-sm text-gray-600">Active Monitoring</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
                <p className="text-3xl font-bold text-red-600">{pendingAlerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts (24h)</p>
                <p className="text-3xl font-bold text-orange-600">
                  {fraudAlerts.filter(
                    alert => new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-3xl font-bold text-green-600">
                  {fraudAlerts.filter(
                    alert => alert.status === 'resolved' && 
                    new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Pending Fraud Alerts</span>
          </CardTitle>
          <CardDescription>
            High-priority alerts requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingAlerts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No pending fraud alerts. System is monitoring transactions.
              </p>
            ) : (
              pendingAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getRiskBadgeColor(alert.risk_score)}>
                          {getRiskLevel(alert.risk_score)} Risk ({alert.risk_score})
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {alert.fraud_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <p className="font-medium text-gray-900">
                        User: {alert.user_profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {alert.user_profiles?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">{alert.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAlertStatus(alert.id, 'reviewed')}
                      >
                        Mark Reviewed
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert History</CardTitle>
          <CardDescription>
            Previously reviewed and resolved fraud alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reviewedAlerts.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No alert history available.
              </p>
            ) : (
              reviewedAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {alert.user_profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-600">{alert.details}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={alert.status === 'resolved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.status}
                    </Badge>
                    <Badge className={getRiskBadgeColor(alert.risk_score)}>
                      {alert.risk_score}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetectionPanel;
