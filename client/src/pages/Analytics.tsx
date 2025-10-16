import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, Users, DollarSign, Award, Loader2 } from "lucide-react";
import type { RevenueSnapshot, EngagementMetric, SponsorMetric, SessionMetric } from "@shared/schema";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Analytics() {
  const { t } = useTranslation('analytics');
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery<RevenueSnapshot[]>({
    queryKey: ["/api/analytics/revenue"],
  });

  const { data: engagementData, isLoading: isLoadingEngagement } = useQuery<EngagementMetric[]>({
    queryKey: ["/api/analytics/engagement"],
  });

  const { data: sessionMetrics, isLoading: isLoadingSession } = useQuery<SessionMetric[]>({
    queryKey: ["/api/analytics/sessions"],
  });

  const { data: sponsorMetrics, isLoading: isLoadingSponsor } = useQuery<SponsorMetric[]>({
    queryKey: ["/api/analytics/sponsors"],
  });

  // Calculate summary stats
  const totalRevenue = revenueData?.reduce((sum, s) => sum + s.totalRevenue, 0) || 0;
  const totalTickets = revenueData?.reduce((sum, s) => sum + s.ticketsSold, 0) || 0;
  const totalSponsors = revenueData?.reduce((sum, s) => sum + s.sponsorshipsCount, 0) || 0;
  const totalEngagement = engagementData?.reduce((sum, e) => sum + e.sessionAttendance, 0) || 0;

  // Prepare chart data
  const ticketTypeData = revenueData && revenueData.length > 0 ? [
    { name: t('earlyBird'), value: revenueData.reduce((sum, s) => sum + s.earlyBirdSold, 0) },
    { name: t('regular'), value: revenueData.reduce((sum, s) => sum + s.regularSold, 0) },
    { name: t('vip'), value: revenueData.reduce((sum, s) => sum + s.vipSold, 0) },
  ] : [];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4" data-testid="text-analytics-title">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">€{(totalRevenue / 100).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('totalRevenueDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ticketsSold')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-tickets-sold">{totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ticketsSoldDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('sponsors')}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-sponsors">{totalSponsors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('sponsorsDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('sessionAttendance')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-session-attendance">{totalEngagement}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('sessionAttendanceDescription')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="revenue" data-testid="tab-revenue">{t('revenueTab')}</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">{t('engagementTab')}</TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">{t('sessionsTab')}</TabsTrigger>
            <TabsTrigger value="sponsors" data-testid="tab-sponsors">{t('sponsorsTab')}</TabsTrigger>
          </TabsList>

          {/* Revenue Analytics */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('revenueTrend')}</CardTitle>
                  <CardDescription>{t('revenueTrendDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRevenue ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : revenueData && revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tickFormatter={(value) => `€${value / 100}`} />
                        <Tooltip 
                          formatter={(value: any) => `€${value / 100}`}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="totalRevenue" stroke={COLORS[0]} name={t('totalRevenue')} />
                        <Line type="monotone" dataKey="ticketRevenue" stroke={COLORS[1]} name="Ticket Revenue" />
                        <Line type="monotone" dataKey="sponsorshipRevenue" stroke={COLORS[2]} name="Sponsorship Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {t('noRevenueData')}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('ticketSalesByType')}</CardTitle>
                  <CardDescription>{t('ticketSalesByTypeDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRevenue ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : ticketTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ticketTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ticketTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {t('noRevenueData')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('engagementMetrics')}</CardTitle>
                <CardDescription>{t('engagementMetricsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEngagement ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : engagementData && engagementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                      <Legend />
                      <Bar dataKey="activeUsers" fill={COLORS[0]} name={t('activeUsers')} />
                      <Bar dataKey="sessionAttendance" fill={COLORS[1]} name={t('sessionAttendance')} />
                      <Bar dataKey="connectionsCreated" fill={COLORS[2]} name={t('connections')} />
                      <Bar dataKey="messagesSent" fill={COLORS[3]} name={t('messagesSent')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    {t('noEngagementData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Analytics */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sessionPerformance')}</CardTitle>
                <CardDescription>{t('sessionPerformanceDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSession ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sessionMetrics && sessionMetrics.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sessionMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sessionId" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendanceCount" fill={COLORS[0]} name={t('attendance')} />
                        <Bar dataKey="totalRatings" fill={COLORS[1]} name={t('totalRatings')} />
                        <Bar dataKey="engagementScore" fill={COLORS[2]} name={t('engagementScore')} />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">{t('sessionId')}</th>
                            <th className="text-left p-2">{t('attendance')}</th>
                            <th className="text-left p-2">{t('avgRating')}</th>
                            <th className="text-left p-2">{t('completion')}</th>
                            <th className="text-left p-2">{t('engagement')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionMetrics.map((metric) => (
                            <tr key={metric.sessionId} className="border-b">
                              <td className="p-2 font-mono text-xs">{metric.sessionId.substring(0, 8)}...</td>
                              <td className="p-2">{metric.attendanceCount}</td>
                              <td className="p-2">{metric.averageRating ? `${metric.averageRating}/5` : "N/A"}</td>
                              <td className="p-2">{metric.completionRate}%</td>
                              <td className="p-2">{metric.engagementScore}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    {t('noSessionData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsor Analytics */}
          <TabsContent value="sponsors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sponsorROI')}</CardTitle>
                <CardDescription>{t('sponsorROIDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSponsor ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sponsorMetrics && sponsorMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={sponsorMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sponsorshipId" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="profileViews" fill={COLORS[0]} name={t('profileViews')} />
                      <Bar dataKey="websiteClicks" fill={COLORS[1]} name={t('websiteClicks')} />
                      <Bar dataKey="logoImpressions" fill={COLORS[2]} name={t('logoImpressions')} />
                      <Bar dataKey="attendeeConnections" fill={COLORS[3]} name={t('connections')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    {t('noSponsorData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
