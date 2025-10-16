import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export default function InstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 shadow-lg border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install WADF 2025</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install our app for quick access, offline support, and a better experience!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              data-testid="button-install-pwa"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              data-testid="button-dismiss-install"
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
