
import React from 'react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, Calendar } from 'lucide-react';
import { PolicyNotification, getNotificationPriority, getNotificationColor } from '@/services/notificationService';
import { Badge } from '@/components/ui/badge';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';

interface PolicyExpirationAlertProps {
  notifications: PolicyNotification[];
  onViewPolicy: (policyId: string) => void;
}

const PolicyExpirationAlert: React.FC<PolicyExpirationAlertProps> = ({
  notifications,
  onViewPolicy,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Upcoming Policy Expirations
      </h3>

      {notifications.map((notification) => {
        const priority = getNotificationPriority(notification.daysRemaining);
        const colorClass = getNotificationColor(priority);

        return (
          <Alert key={notification.id} className={`${colorClass} border`}>
            <AlertDescription className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{notification.provider} - {notification.type} Insurance</div>
                <div className="text-sm">
                  Policy: {notification.policyNumber} | 
                  Expires: <span className="font-medium">{format(new Date(notification.expiryDate), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {notification.daysRemaining === 0 
                      ? "Expires today" 
                      : `${notification.daysRemaining} days remaining`}
                  </span>
                  {notification.familyMemberId && (
                    <Badge variant="outline" className="ml-2">
                      <FamilyMemberDisplay memberId={notification.familyMemberId} />
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewPolicy(notification.id)}
              >
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default PolicyExpirationAlert;
