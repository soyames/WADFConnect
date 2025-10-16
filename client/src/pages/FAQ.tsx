import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is the West African Design Forum?",
        a: "WADF is the premier event celebrating and elevating West Africa's creative industry. It's a multi-day conference bringing together designers, innovators, and industry experts from across the region and beyond."
      },
      {
        q: "When and where is WADF 2025?",
        a: "WADF 2025 will take place June 15-17, 2025 at the Eko Convention Centre in Lagos, Nigeria."
      },
      {
        q: "Who should attend WADF?",
        a: "WADF is perfect for designers, product managers, creative professionals, entrepreneurs, students, and anyone interested in West Africa's creative economy and innovation landscape."
      }
    ]
  },
  {
    category: "Tickets",
    questions: [
      {
        q: "How do I purchase a ticket?",
        a: "Simply visit the Tickets page, select your preferred pass (Early Bird, Regular, or VIP), and complete the secure checkout process. Your account will be automatically created upon successful payment."
      },
      {
        q: "What's included in each ticket type?",
        a: "All tickets include full conference access, sessions, workshops, networking events, and a digital certificate. VIP passes add exclusive benefits like lounge access, priority seating, speaker meet & greets, and premium swag."
      },
      {
        q: "Can I get a refund?",
        a: "Tickets are generally non-refundable. However, we offer ticket transfers if you can't attend. Contact our support team for special circumstances."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards and mobile money through our secure payment partners Paystack and Flutterwave."
      }
    ]
  },
  {
    category: "Speakers",
    questions: [
      {
        q: "How do I submit a session proposal?",
        a: "Visit the Call for Proposals page, sign in or create an account, and complete the submission form with your session details. Our team will review all proposals and notify you of the decision."
      },
      {
        q: "What makes a good proposal?",
        a: "Strong proposals are specific, actionable, and relevant to our audience. Focus on clear learning outcomes, practical insights, and how your session will benefit attendees. Original content and diverse perspectives are highly valued."
      },
      {
        q: "When is the CFP deadline?",
        a: "The Call for Proposals closes on March 31, 2025. Decisions will be communicated within 2 weeks of submission."
      },
      {
        q: "Do speakers get free tickets?",
        a: "Yes! Accepted speakers receive a complimentary conference pass and recognition in our speaker community."
      }
    ]
  },
  {
    category: "Sponsors",
    questions: [
      {
        q: "How can my company sponsor WADF?",
        a: "Visit the Sponsors page to explore our partnership packages ranging from Supporter (€50) to Diamond (€5,000). Each tier offers different benefits including brand visibility, speaking opportunities, and delegate passes."
      },
      {
        q: "What are the sponsorship benefits?",
        a: "Benefits vary by tier and include logo placement, social media promotion, booth space, speaking slots, delegate passes, and email list access. Diamond sponsors receive custom benefits packages."
      },
      {
        q: "Can I customize my sponsorship package?",
        a: "Absolutely! For Gold and Diamond tiers, we're happy to discuss custom packages that align with your specific goals. Contact our partnerships team after selecting a tier."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2" variant="outline" data-testid="badge-faq">
            <HelpCircle className="h-3 w-3" />
            Help Center
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about WADF 2025
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section, idx) => (
            <Card key={idx} data-testid={`card-faq-${section.category.toLowerCase()}`}>
              <CardHeader>
                <CardTitle className="text-2xl">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-chart-2/5 border-none">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:hello@wadf.org" className="text-primary hover:underline">
                  hello@wadf.org
                </a>
              </div>
              <div>
                <span className="font-medium">Response time:</span>{" "}
                <span className="text-muted-foreground">Within 24 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
