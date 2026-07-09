import { useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/api/payment';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2, Loader2, Zap, FileText, BarChart3, MessageSquare, Mic, Map, Linkedin, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import CountUp from 'react-countup';

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
  onUpgraded?: () => void;
  featureName?: string;
  usageCount?: number;
  limit?: number;
}

/**
 * Upgrade to Pro Plan Modal (₹89/month).
 */
export default function UpgradeModal({ open, onClose, onUpgraded, featureName, usageCount, limit }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const order = await createRazorpayOrder({ plan: 'Pro' });
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ASCEND',
        description: 'Upgrade to Pro Plan',
        order_id: order.orderId,
        prefill: {
          name: order.userName,
          email: order.userEmail,
        },
        theme: {
          color: '#2563EB',
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verification = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verification.success) {
              toast.success('Successfully upgraded to Pro Plan!');
              onClose();
              if (onUpgraded) onUpgraded();
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (error) {
            toast.error('Verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md p-6 glass-panel border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
        <DialogHeader className="text-center items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 blur-xl opacity-40 animate-pulse" />
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="h-8 w-8 text-white animate-bounce" />
            </div>
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              Upgrade to Ascend Pro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm font-medium">
              {featureName && usageCount !== undefined && limit !== undefined
                ? `You've used ${usageCount}/${limit} free ${featureName} sessions. Upgrade for unlimited access!`
                : 'Unlock unlimited access to all AI-powered career tools'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-6 border-y border-border/40 my-2">
          {PRO_FEATURES.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/90">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 text-center">
          <div className="text-2xl font-extrabold flex items-center justify-center gap-1">
            <span className="text-muted-foreground text-sm font-normal">Only</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              ₹<CountUp end={89} duration={1.5} />
            </span>
            <span className="text-muted-foreground text-xs font-normal">/ month</span>
          </div>

          <Button 
            onClick={handleUpgrade} 
            disabled={loading} 
            className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:brightness-110 text-white border-0 glow-hover shadow-lg shadow-orange-500/25 active:scale-98 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upgrading...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4 fill-white" /> Upgrade Now
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground leading-none">Safe checkout via Razorpay • 100% money-back guarantee</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
