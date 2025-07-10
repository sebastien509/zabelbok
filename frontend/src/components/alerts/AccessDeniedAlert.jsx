// components/alerts/AccessDeniedAlert.jsx

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AccessDeniedAlert({ reason = "Access denied", onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Denied ❌</DialogTitle>
          <DialogDescription className="text-red-600">
            {reason}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Back to Dashboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
