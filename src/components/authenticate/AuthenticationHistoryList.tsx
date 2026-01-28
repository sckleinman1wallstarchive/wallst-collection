import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { AuthenticationRecord } from '@/hooks/useAuthenticationHistory';
import { ManualVerificationDialog } from './ManualVerificationDialog';

interface AuthenticationHistoryListProps {
  records: AuthenticationRecord[];
  isLoading: boolean;
  onUpdateVerification: (id: string, data: {
    manual_verdict: string;
    manual_notes?: string;
    verified_by?: string;
    verification_source?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AuthenticationHistoryList({
  records,
  isLoading,
  onUpdateVerification,
  onDelete,
}: AuthenticationHistoryListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [verifyingRecord, setVerifyingRecord] = useState<AuthenticationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<AuthenticationRecord | null>(null);

  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    if (filter === 'authentic') return record.manual_verdict === 'authentic' || record.ai_verdict === 'likely_authentic';
    if (filter === 'fake') return record.manual_verdict === 'fake' || record.ai_verdict === 'likely_fake';
    if (filter === 'needs-verification') return !record.manual_verdict;
    return true;
  });

  const getAIVerdictBadge = (verdict: string | null, score: number | null) => {
    if (!verdict) return null;
    
    const scoreText = score ? `${score}%` : '';
    
    switch (verdict) {
      case 'likely_authentic':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <ShieldCheck className="h-3 w-3 mr-1" />
            AI: {scoreText} Authentic
          </Badge>
        );
      case 'likely_fake':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <ShieldAlert className="h-3 w-3 mr-1" />
            AI: {scoreText} Fake
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            <ShieldQuestion className="h-3 w-3 mr-1" />
            AI: {scoreText} Inconclusive
          </Badge>
        );
    }
  };

  const getManualVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;
    
    switch (verdict) {
      case 'authentic':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified Authentic
          </Badge>
        );
      case 'fake':
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Verified Fake
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <HelpCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ShieldQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No authentication history yet</p>
        <p className="text-sm">Save your first authentication check to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({records.length})</SelectItem>
            <SelectItem value="authentic">Authentic</SelectItem>
            <SelectItem value="fake">Fake</SelectItem>
            <SelectItem value="needs-verification">Needs Verification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{record.item_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {record.brand}
                  </Badge>
                  {record.size && (
                    <Badge variant="outline" className="text-xs">
                      Size: {record.size}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {getAIVerdictBadge(record.ai_verdict, record.ai_score)}
                  {getManualVerdictBadge(record.manual_verdict)}
                  {!record.manual_verdict && (
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      Needs Verification
                    </Badge>
                  )}
                </div>

                {record.manual_notes && (
                  <p className="text-sm text-muted-foreground">
                    "{record.manual_notes}"
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {format(new Date(record.created_at), 'MMM d, yyyy')}
                  {record.verified_by && ` • Verified by ${record.verified_by}`}
                </p>
              </div>

              {/* Thumbnail */}
              {record.image_urls && record.image_urls.length > 0 && (
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={record.image_urls[0]}
                    alt={record.item_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyingRecord(record)}
              >
                <Edit className="h-4 w-4 mr-1" />
                {record.manual_verdict ? 'Edit Verification' : 'Add Verification'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeletingRecord(record)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Verification Dialog */}
      {verifyingRecord && (
        <ManualVerificationDialog
          open={!!verifyingRecord}
          onOpenChange={(open) => !open && setVerifyingRecord(null)}
          onSave={async (data) => {
            await onUpdateVerification(verifyingRecord.id, data);
            setVerifyingRecord(null);
          }}
          initialData={{
            manual_verdict: verifyingRecord.manual_verdict || undefined,
            manual_notes: verifyingRecord.manual_notes || undefined,
            verified_by: verifyingRecord.verified_by || undefined,
            verification_source: verifyingRecord.verification_source || undefined,
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Authentication Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the authentication record for "{deletingRecord?.item_name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deletingRecord) {
                  await onDelete(deletingRecord.id);
                  setDeletingRecord(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
