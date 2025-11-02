import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import CFP from "@/pages/CFP";
import Network from "@/pages/Network";

export default function FAQ() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("faq");

  // Determine active tab based on URL
  useEffect(() => {
    if (location === "/cfp") {
      setActiveTab("speakers");
    } else if (location === "/network") {
      setActiveTab("network");
    } else {
      setActiveTab("faq");
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "speakers") {
      setLocation("/cfp");
    } else if (value === "network") {
      setLocation("/network");
    } else {
      setLocation("/faq");
    }
  };

  const faqSections = [
    {
      key: "general",
      questionCount: 3
    },
    {
      key: "tickets",
      questionCount: 4
    },
    {
      key: "speakers",
      questionCount: 4
    },
    {
      key: "sponsors",
      questionCount: 3
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Community Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect, learn, and engage with the WADF community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="tabs-community">
            <TabsTrigger value="faq" data-testid="tab-faq">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="speakers" data-testid="tab-speakers">
              Speakers (CFP)
            </TabsTrigger>
            <TabsTrigger value="network" data-testid="tab-network">
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 gap-2" variant="outline" data-testid="badge-faq">
                  <HelpCircle className="h-3 w-3" />
                  {t("faq.badge")}
                </Badge>
                <h2 className="font-serif text-4xl font-bold mb-4">
                  {t("faq.pageTitle")} <span className="text-primary">{t("faq.pageTitleHighlight")}</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("faq.subtitle")}
                </p>
              </div>

              <div className="space-y-8">
                {faqSections.map((section, idx) => (
                  <Card key={idx} data-testid={`card-faq-${section.key}`}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t(`faq.${section.key}.title`)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {Array.from({ length: section.questionCount }, (_, qIdx) => {
                          const qNum = qIdx + 1;
                          return (
                            <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                              <AccordionTrigger className="text-left font-medium">
                                {t(`faq.${section.key}.q${qNum}`)}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground leading-relaxed">
                                {t(`faq.${section.key}.a${qNum}`)}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-12 bg-gradient-to-br from-primary/5 to-chart-2/5 border-none">
                <CardHeader>
                  <CardTitle>{t("faq.contact.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t("faq.contact.description")}
                  </p>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium">{t("faq.contact.email")}</span>{" "}
                      <a href={`mailto:${t("faq.contact.emailAddress")}`} className="text-primary hover:underline">
                        {t("faq.contact.emailAddress")}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">{t("faq.contact.responseTime")}</span>{" "}
                      <span className="text-muted-foreground">{t("faq.contact.responseTimeValue")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="speakers">
            <CFP />
          </TabsContent>

          <TabsContent value="network">
            <Network />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
