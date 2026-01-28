import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    manual_verdict: string;
    manual_notes?: string;
    verified_by?: string;
    verification_source?: string;
  }) => Promise<void>;
  initialData?: {
    manual_verdict?: string;
    manual_notes?: string;
    verified_by?: string;
    verification_source?: string;
  };
}

export function ManualVerificationDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: ManualVerificationDialogProps) {
  const [verdict, setVerdict] = useState(initialData?.manual_verdict || '');
  const [notes, setNotes] = useState(initialData?.manual_notes || '');
  const [verifiedBy, setVerifiedBy] = useState(initialData?.verified_by || '');
  const [source, setSource] = useState(initialData?.verification_source || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!verdict) return;
    
    setIsSaving(true);
    try {
      await onSave({
        manual_verdict: verdict,
        manual_notes: notes || undefined,
        verified_by: verifiedBy || undefined,
        verification_source: source || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const verdictOptions = [
    { value: 'authentic', label: 'Authentic', icon: CheckCircle2, color: 'text-green-500 border-green-500 bg-green-500/10' },
    { value: 'fake', label: 'Fake', icon: XCircle, color: 'text-red-500 border-red-500 bg-red-500/10' },
    { value: 'unknown', label: 'Unknown', icon: HelpCircle, color: 'text-muted-foreground border-muted-foreground bg-muted' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Authenticity</DialogTitle>
          <DialogDescription>
            Record your manual verification of this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Verdict Selector */}
          <div className="space-y-2">
            <Label>Your Verdict</Label>
            <div className="grid grid-cols-3 gap-2">
              {verdictOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVerdict(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                      verdict === option.value
                        ? option.color
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', verdict === option.value && option.color.split(' ')[0])} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified By */}
          <div className="space-y-2">
            <Label>Verified By</Label>
            <Select value={verifiedBy} onValueChange={setVerifiedBy}>
              <SelectTrigger>
                <SelectValue placeholder="Select who verified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parker">Parker</SelectItem>
                <SelectItem value="spencer">Spencer</SelectItem>
                <SelectItem value="professional">Professional Authenticator</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Source */}
          <div className="space-y-2">
            <Label>Verification Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="How was it verified?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In-Person Check</SelectItem>
                <SelectItem value="online-service">Online Authentication Service</SelectItem>
                <SelectItem value="seller-confirmation">Seller Confirmation</SelectItem>
                <SelectItem value="brand-verification">Brand Verification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional details about the verification..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!verdict || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Verification'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
