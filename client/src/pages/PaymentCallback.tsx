import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found");
        return;
      }

      try {
        const response = await fetch(`/api/payment/verify/${reference}`);
        const data = await response.json();

        if (data.status === "success") {
          setStatus("success");
          setMessage("Payment successful! Your ticket has been confirmed.");
        } else {
          setStatus("failed");
          setMessage("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("An error occurred while verifying payment.");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-4">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <CardTitle>Verifying Payment</CardTitle>
                <CardDescription>Please wait while we confirm your payment...</CardDescription>
              </>
            )}
            {status === "success" && (
              <>
                <div className="mx-auto mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}
            {status === "failed" && (
              <>
                <div className="mx-auto mb-4">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
                <CardTitle>Payment Failed</CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "success" && (
              <Button onClick={() => setLocation("/agenda")} size="lg" data-testid="button-view-agenda">
                View Conference Agenda
              </Button>
            )}
            {status === "failed" && (
              <Button onClick={() => setLocation("/tickets")} variant="outline" size="lg" data-testid="button-try-again">
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
