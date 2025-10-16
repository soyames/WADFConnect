import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: any;
  };
}

export class PaystackService {
  private baseUrl = "https://api.paystack.co";
  
  async initializeTransaction(
    email: string, 
    amount: number, // in kobo (smallest currency unit)
    reference: string,
    metadata?: any
  ): Promise<PaystackInitializeResponse> {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        metadata,
        callback_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/callback`,
      }),
    });

    return await response.json();
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return await response.json();
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!PAYSTACK_SECRET_KEY) {
      return false;
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest("hex");

    return hash === signature;
  }
}

export const paystackService = new PaystackService();
export const PAYSTACK_PUBLIC_KEY_VALUE = PAYSTACK_PUBLIC_KEY;
