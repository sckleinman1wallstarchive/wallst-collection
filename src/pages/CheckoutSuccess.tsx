import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { CheckCircle, ShoppingBag, ArrowLeft, Mail, CreditCard } from 'lucide-react';
import { useShopCartStore } from '@/stores/shopCartStore';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useShopCartStore(state => state.clearCart);

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-chart-2/20 flex items-center justify-center">
             <CheckCircle className="h-12 w-12 text-chart-2" />
          </div>
           <CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
             Thank you for your purchase! Your payment has been processed successfully.
          </p>

          {sessionId && (
             <div className="bg-muted/50 rounded-lg p-4">
               <p className="text-sm text-muted-foreground">
                 Order Reference: <span className="font-mono font-medium text-foreground">{sessionId.slice(-8).toUpperCase()}</span>
               </p>
             </div>
          )}

           <div className="space-y-3 text-sm text-muted-foreground">
             <div className="flex items-center gap-2 justify-center">
               <Mail className="h-4 w-4" />
               <span>You'll receive an email confirmation shortly</span>
             </div>
             <div className="flex items-center gap-2 justify-center">
               <CreditCard className="h-4 w-4" />
               <span>Funds deposit within 2-7 business days</span>
             </div>
           </div>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
