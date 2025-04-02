
import React, { useState, useEffect } from 'react';
import { getAllAuditRecords, getAuditRecordsByType } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuditTrail from '@/components/common/AuditTrail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuditTrailPage = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = getAllAuditRecords();
        setRecords(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching audit records:', error);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading audit trail data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground">
          View the history of all changes to your investments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Activities</TabsTrigger>
              <TabsTrigger value="stock">Stocks</TabsTrigger>
              <TabsTrigger value="fixedDeposit">Fixed Deposits</TabsTrigger>
              <TabsTrigger value="sip">SIP</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="gold">Gold</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <AuditTrail records={records} entityType="Investment" />
            </TabsContent>
            
            <TabsContent value="stock">
              <AuditTrail records={records.filter(r => r.entityType === 'stock')} entityType="Stock" />
            </TabsContent>
            
            <TabsContent value="fixedDeposit">
              <AuditTrail records={records.filter(r => r.entityType === 'fixedDeposit')} entityType="Fixed Deposit" />
            </TabsContent>
            
            <TabsContent value="sip">
              <AuditTrail records={records.filter(r => r.entityType === 'sip')} entityType="SIP" />
            </TabsContent>
            
            <TabsContent value="insurance">
              <AuditTrail records={records.filter(r => r.entityType === 'insurance')} entityType="Insurance" />
            </TabsContent>
            
            <TabsContent value="gold">
              <AuditTrail records={records.filter(r => r.entityType === 'gold')} entityType="Gold" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrailPage;
