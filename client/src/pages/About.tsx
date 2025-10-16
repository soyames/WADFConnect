import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            {t("about.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <h2 className="font-serif text-3xl font-bold mb-4">{t("about.mission")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("about.missionText")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card data-testid="card-vision">
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t("about.vision")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="leading-relaxed">
                {t("about.visionText")}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-values">
            <CardHeader>
              <div className="p-3 rounded-lg bg-chart-2/10 w-fit mb-4">
                <Heart className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-2xl">{t("about.values")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("about.value1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("about.value2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("about.value3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("about.value4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-none">
          <CardHeader>
            <div className="p-3 rounded-lg bg-chart-3/10 w-fit mb-4">
              <Users className="h-6 w-6 text-chart-3" />
            </div>
            <CardTitle className="text-2xl">{t("about.whatWeDo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.whatWeDoText")}
            </p>
          </CardContent>
        </Card>

        <div className="mt-16 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Event Information</h2>
          <div className="grid gap-8 md:grid-cols-3 mt-8">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Date</div>
              <div className="text-lg font-semibold">{t("hero.date")}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Location</div>
              <div className="text-lg font-semibold">Accra, Ghana</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Venue</div>
              <div className="text-lg font-semibold">Conference Center</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
