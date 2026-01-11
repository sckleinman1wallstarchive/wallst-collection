import { useCashFlow } from '@/hooks/useCashFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Building2, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CashFlowStatementProps {
  onBack: () => void;
}

export const CashFlowStatement = ({ onBack }: CashFlowStatementProps) => {
  const { cashFlowData, isLoading } = useCashFlow();

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
    return amount < 0 ? `(${formatted})` : formatted;
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-chart-2';
    if (amount < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { operating, investing, financing, summary, details } = cashFlowData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statement of Cash Flows</h1>
          <p className="text-muted-foreground text-sm">
            All-time cash flow analysis
          </p>
        </div>
      </div>

      {/* Operating Activities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Cash Flows from Operating Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sales" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                  <span className="text-sm">Cash received from sales</span>
                  <span className={`font-mono text-sm font-medium ${getAmountColor(operating.cashFromSales)}`}>
                    {formatCurrency(operating.cashFromSales)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 space-y-1 max-h-48 overflow-y-auto">
                  {details.salesItems.length > 0 ? (
                    details.salesItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground py-1 border-b border-border/50 last:border-0">
                        <span className="truncate flex-1">{item.date} - {item.name}</span>
                        <span className="font-mono ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No sales recorded</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="purchases" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                  <span className="text-sm">Cash paid for inventory</span>
                  <span className={`font-mono text-sm font-medium ${getAmountColor(-operating.cashPaidForInventory)}`}>
                    {formatCurrency(-operating.cashPaidForInventory)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 space-y-1 max-h-48 overflow-y-auto">
                  {details.purchaseItems.length > 0 ? (
                    details.purchaseItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground py-1 border-b border-border/50 last:border-0">
                        <span className="truncate flex-1">{item.date} - {item.name}</span>
                        <span className="font-mono ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No purchases recorded</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <span className="font-medium text-sm">Net Cash from Operating Activities</span>
            <Badge variant="outline" className={`font-mono ${getAmountColor(operating.netOperating)}`}>
              {formatCurrency(operating.netOperating)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Investing Activities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-1/10 rounded-lg">
              <Building2 className="h-5 w-5 text-chart-1" />
            </div>
            <CardTitle className="text-lg">Cash Flows from Investing Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm text-muted-foreground">Equipment purchases</span>
            <span className="font-mono text-sm">{formatCurrency(-investing.equipmentPurchases)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm text-muted-foreground">Equipment sales</span>
            <span className="font-mono text-sm">{formatCurrency(investing.equipmentSales)}</span>
          </div>
          
          {investing.netInvesting === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No investing activities recorded
            </p>
          )}
          
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <span className="font-medium text-sm">Net Cash from Investing Activities</span>
            <Badge variant="outline" className={`font-mono ${getAmountColor(investing.netInvesting)}`}>
              {formatCurrency(investing.netInvesting)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Financing Activities */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-3/10 rounded-lg">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <CardTitle className="text-lg">Cash Flows from Financing Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm">Spencer capital contribution</span>
            <span className={`font-mono text-sm ${getAmountColor(financing.spencerContributions)}`}>
              {formatCurrency(financing.spencerContributions)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm">Parker capital contribution</span>
            <span className={`font-mono text-sm ${getAmountColor(financing.parkerContributions)}`}>
              {formatCurrency(financing.parkerContributions)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm text-muted-foreground">Partner distributions</span>
            <span className="font-mono text-sm">{formatCurrency(-financing.distributions)}</span>
          </div>
          
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <span className="font-medium text-sm">Net Cash from Financing Activities</span>
            <Badge variant="outline" className={`font-mono ${getAmountColor(financing.netFinancing)}`}>
              {formatCurrency(financing.netFinancing)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm">Net increase (decrease) in cash</span>
            <span className={`font-mono text-sm font-medium ${getAmountColor(summary.netCashChange)}`}>
              {formatCurrency(summary.netCashChange)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <span className="text-sm text-muted-foreground">Cash at beginning of period</span>
            <span className="font-mono text-sm">{formatCurrency(summary.beginningCash)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center py-3 px-3 bg-background rounded-md">
            <span className="font-semibold">Cash at End of Period</span>
            <span className={`font-mono text-lg font-bold ${getAmountColor(summary.endingCash)}`}>
              {formatCurrency(summary.endingCash)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
