import { useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from 'zite-endpoints-sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle2, Loader2, Zap, FileText, BarChart3, MessageSquare, Mic, Map, Linkedin, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window { Razorpay: any; }
}

const PRO_FEATURES = [
  { icon: FileText, label: 'Unlimited Resume Builds' },
  { icon: BarChart3, label: 'Unlimited ATS Analyses' },
  { icon: MessageSquare, label: 'Unlimited Cover Letters' },
  { icon: Mic, label: 'Unlimited Interview Prep' },
  { icon: Map, label: 'Unlimited Career Roadmaps' },
  { icon: Linkedin, label: 'Unlimited LinkedIn Reviews' },
  { icon: Lightbulb, label: 'Unlimited Project Ideas' },
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgraded: () => void;
  featureName?: string;
  usageCount?: number;
  limit?: number;
}

export default function UpgradeModal({ open, onClose, onUpgraded, featureName, usageCount, limit }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.head.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await loadRazorpayScript();
      const order = await createRazorpayOrder({});

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Ascend Pro',
        description: 'Unlimited access to all AI career tools',
        order_id: order.orderId,
        prefill: { name: order.userName, email: order.userEmail },
        theme: { color: '#4F46E5' },
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('🎉 Welcome to Ascend Pro! Enjoy unlimited access.');
            onUpgraded();
            onClose();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-2">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">Upgrade to Ascend Pro</DialogTitle>
          <DialogDescription>
            {featureName
              ? `You've used ${usageCount}/${limit} free ${featureName} sessions. Upgrade for unlimited access!`
              : 'Unlock unlimited access to all AI-powered career tools'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {PRO_FEATURES.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">₹89</span>
            <span className="text-muted-foreground text-sm">/ lifetime</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">One-time payment • No recurring charges</p>
        </div>

        <Button onClick={handleUpgrade} disabled={loading} size="lg" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><Zap className="mr-2 h-4 w-4" />Upgrade Now — ₹89</>}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
