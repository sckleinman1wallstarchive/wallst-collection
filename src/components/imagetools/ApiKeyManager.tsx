import { useState } from 'react';
import { useRemoveBgKeys } from '@/hooks/useRemoveBgKeys';
import { useRemoveBgUsage } from '@/hooks/useRemoveBgUsage';
import type { KeyUsage } from '@/hooks/useRemoveBgUsage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Key, Plus, Trash2, GripVertical, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ApiKeyManager() {
  const { keys, isLoading, addKey, deleteKey, isAdding } = useRemoveBgKeys();
  const { data: usage } = useRemoveBgUsage();
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddKey = () => {
    if (!newKeyName.trim() || !newApiKey.trim()) return;
    
    addKey(
      { keyName: newKeyName.trim(), apiKey: newApiKey.trim() },
      {
        onSuccess: () => {
          setNewKeyName('');
          setNewApiKey('');
          setIsDialogOpen(false);
        }
      }
    );
  };

  const getKeyUsage = (keyId: string): KeyUsage | undefined => {
    return usage?.keys.find(k => k.id === keyId);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
  };

  const getStatusIcon = (keyUsage?: KeyUsage) => {
    if (!keyUsage) return <Circle className="h-4 w-4 text-muted-foreground" />;
    if (keyUsage.exhausted) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (keyUsage.remaining <= 5) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (keyUsage?: KeyUsage, isActive?: boolean) => {
    if (!keyUsage) return 'No usage data';
    if (keyUsage.exhausted) return 'Exhausted';
    if (isActive) return 'Active';
    return 'Standby';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            API Keys ({keys.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Remove.bg API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Account 1, Backup Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="rmbg_xxxxxxxx"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your free API key at{' '}
                    <a 
                      href="https://www.remove.bg/api#api-key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      remove.bg/api
                    </a>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddKey} 
                  disabled={!newKeyName.trim() || !newApiKey.trim() || isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {keys.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No API keys configured</p>
            <p className="text-xs">Add your first remove.bg API key to get started</p>
          </div>
        ) : (
          keys.map((key, index) => {
            const keyUsage = getKeyUsage(key.id);
            const isActiveKey = usage?.activeKey === key.key_name;
            const progressPercent = keyUsage ? (keyUsage.used / keyUsage.limit) * 100 : 0;
            
            return (
              <div
                key={key.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isActiveKey && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-4">{index + 1}.</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{key.key_name}</span>
                    {getStatusIcon(keyUsage)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-muted-foreground">
                      {maskApiKey(key.api_key)}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      • {getStatusText(keyUsage, isActiveKey)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {keyUsage?.used ?? 0}/{keyUsage?.limit ?? 50}
                    </div>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          progressPercent >= 100 ? "bg-destructive" :
                          progressPercent >= 90 ? "bg-yellow-500" :
                          "bg-green-500"
                        )}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{key.key_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteKey(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
