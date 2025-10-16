import { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, UserRole } from "@shared/schema";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from backend using Firebase UID
        try {
          const response = await fetch(`/api/users/firebase/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else if (response.status === 404) {
            // User exists in Firebase but not in database - create record
            console.log("Creating user record in database...");
            const createResponse = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || "User",
                firebaseUid: user.uid,
                role: "attendee"
              }),
            });
            
            if (createResponse.ok) {
              const createdUser = await createResponse.json();
              setUserData(createdUser);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user record in backend
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          firebaseUid: userCredential.user.uid,
          role: "attendee"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user record");
      }

      // Fetch the created user data
      const createdUser = await response.json();
      setUserData(createdUser);
    } catch (error: any) {
      // Provide helpful error messages
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already registered. Please sign in instead.");
      } else if (error.code === "auth/configuration-not-found") {
        throw new Error("Authentication is not configured. Please contact support or try again later.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address.");
      } else {
        throw new Error(error.message || "Failed to create account. Please try again.");
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
