import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function FirebaseTest() {
  const [config, setConfig] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>("checking");

  useEffect(() => {
    // Get Firebase config
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "NOT SET",
      authDomain: auth.app.options.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "NOT SET",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "NOT SET",
    };
    setConfig(firebaseConfig);

    // Test auth connection
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthStatus(`authenticated as ${user.email}`);
      } else {
        setAuthStatus("not authenticated");
      }
    });
  }, []);

  const isConfigured = config?.apiKey !== "NOT SET" && 
                        config?.apiKey !== "demo-api-key" &&
                        config?.projectId !== "demo-project";

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Firebase Configuration Test</h1>

      <div className="space-y-6">
        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
              Firebase Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant={isConfigured ? "default" : "destructive"}>
                {isConfigured ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            
            {config && (
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">API Key:</span>{" "}
                  <span className={config.apiKey === "NOT SET" || config.apiKey === "demo-api-key" ? "text-red-500" : "text-green-500"}>
                    {config.apiKey === "NOT SET" ? "NOT SET" : 
                     config.apiKey === "demo-api-key" ? "DEMO (Not Real)" : 
                     `${config.apiKey.substring(0, 20)}...`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Project ID:</span>{" "}
                  <span className={config.projectId === "NOT SET" || config.projectId === "demo-project" ? "text-red-500" : "text-green-500"}>
                    {config.projectId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auth Domain:</span>{" "}
                  <span className="text-foreground">{config.authDomain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">App ID:</span>{" "}
                  <span className={config.appId === "NOT SET" ? "text-red-500" : "text-green-500"}>
                    {config.appId === "NOT SET" ? "NOT SET" : `${config.appId.substring(0, 20)}...`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <Badge variant={authStatus.includes("authenticated as") ? "default" : "secondary"}>
                {authStatus}
              </Badge>
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConfigured ? (
              <div className="space-y-2">
                <p className="text-red-500 font-semibold">❌ Firebase is not properly configured</p>
                <p>Please ensure these environment variables are set in Replit Secrets:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>VITE_FIREBASE_API_KEY</li>
                  <li>VITE_FIREBASE_PROJECT_ID</li>
                  <li>VITE_FIREBASE_APP_ID</li>
                </ul>
              </div>
            ) : authStatus === "not authenticated" ? (
              <div className="space-y-2">
                <p className="text-green-500 font-semibold">✅ Firebase is configured correctly</p>
                <p>To create admin account:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Create user in Firebase Console with: admin@wadf.org</li>
                  <li>Copy the Firebase UID</li>
                  <li>Update database: UPDATE users SET firebase_uid = 'uid', role = 'admin' WHERE email = 'admin@wadf.org'</li>
                  <li>Login at <a href="/login" className="text-primary underline">/login</a></li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-green-500 font-semibold">✅ You are authenticated!</p>
                <p>
                  <a href="/admin" className="text-primary underline">Go to Admin Dashboard</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
