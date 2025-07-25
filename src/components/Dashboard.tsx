import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Star,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";
import { useSurveyData, Survey } from "@/hooks/useSurveyData";
import WithdrawalContainer from "./WithdrawalContainer";
import ReferralCodeInput from "@/components/ReferralCodeInput";
import SurveyLimitModal from "./SurveyLimitModal";
import SurveyQuestion from "@/components/SurveyQuestion";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

const Dashboard = () => {
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { toast } = useToast();
  const { planData, surveyData, loading, getCurrentPlan, getAvailableSurveys, completeSurvey } = useSurveyData();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }
    };
    fetchUser();
  }, []);

  const handleSurveyComplete = async (surveyId: string) => {
    completeSurvey(surveyId);
    setCurrentSurvey(null);
    toast({
      title: "Survey Completed! 🎉",
      description: `You earned KSh ${surveyData?.surveys.find(s => s.id === surveyId)?.reward}! Keep it up!`,
    });
  };

  const handleSurveyCancel = () => {
    setCurrentSurvey(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!planData || !surveyData) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">Data Loading Error</h3>
                <p className="text-red-700 mt-2">
                  Could not load dashboard data. Please refresh the page or try again later.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const availableSurveys = getAvailableSurveys();
  const userProgress = surveyData.userProgress;

  const stats = [
    {
      title: "Total Earnings",
      value: `KSh ${userProgress.totalEarnings.toLocaleString()}`,
      change: `+KSh ${userProgress.pendingEarnings}`,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Surveys Completed",
      value: userProgress.completedSurveys.length.toString(),
      change: `${userProgress.surveysCompletedToday} today`,
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Current Plan",
      value: currentPlan?.planName || "No Plan",
      change: `${currentPlan?.dailySurvey || 0} daily limit`,
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "Referrals",
      value: userProgress.referrals.totalReferrals.toString(),
      change: `KSh ${userProgress.referrals.referralEarnings}`,
      icon: Users,
      color: "text-warning"
    }
  ];

  const handleStartSurvey = (surveyId: string) => {
    if (!currentPlan) {
      toast({
        title: "No Plan Selected",
        description: "Please upgrade your plan to access surveys.",
        variant: "destructive"
      });
      return;
    }

    if (userProgress.surveysCompletedToday >= currentPlan.dailySurvey) {
      setShowLimitModal(true);
      return;
    }

    const survey = surveyData.surveys.find(s => s.id === surveyId);
    if (!survey) {
      toast({
        title: "Survey Not Available",
        description: "This survey is not available.",
        variant: "destructive"
      });
      return;
    }

    if (!survey.questions || survey.questions.length === 0) {
      toast({
        title: "Survey Error",
        description: "This survey has no questions available.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentSurvey(survey);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userProgress.referrals.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleWithdrawal = () => {
    if (userProgress.pendingEarnings < (currentPlan?.minimumWithdrawal || 0)) {
      toast({
        title: "Insufficient Balance",
        description: `You need KSh ${(currentPlan?.minimumWithdrawal || 0) - userProgress.pendingEarnings} more to withdraw`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal will be processed within 24 hours",
    });
  };

  // toggleSidebar and closeSidebar are now from useSidebar context

  return (
    <div className="flex min-h-screen w-full bg-dashboard">
      <div className={cn(
        "sidebar-container fixed inset-y-0 left-0 z-50 md:relative md:z-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 transition-transform duration-300 ease-in-out"
      )}>
        <Sidebar />
      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "ml-0 md:ml-[240px] mt-12 md:mt-16"
      )}>
        <SurveyLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          currentPlanName={currentPlan?.planName || "No Plan"}
          dailyLimit={currentPlan?.dailySurvey || 0}
          surveysCompletedToday={userProgress.surveysCompletedToday}
        />
        
        {currentSurvey ? (
          <div className="p-4 md:p-6 lg:p-8">
            <SurveyQuestion
              questions={currentSurvey.questions || []}
              surveyId={currentSurvey.id}
              reward={currentSurvey.reward}
              title={currentSurvey.title}
              duration={currentSurvey.duration}
              onComplete={handleSurveyComplete}
              onCancel={handleSurveyCancel}
            />
          </div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-4rem)]">
            {/* Page 1: Dashboard Overview */}
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Welcome back, {userName}!
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Here's your survey dashboard overview
                </p>
              </div>

              {/* Stats Grid - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat, index) => (
                  <Card key={index} className="shadow-soft hover:shadow-glow transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-success mt-1">
                        {stat.change} from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Referral Code Section */}
              <div className="mb-6 md:mb-8">
                <ReferralCodeInput />
              </div>

              {/* Available Surveys Section - Mobile Optimized */}
              <Card className="shadow-soft mb-6 md:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                    Available Surveys
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Complete surveys to earn money
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
                  <div className="max-h-80 md:max-h-96 overflow-y-auto border border-border/50 rounded-lg bg-muted/20 p-2 md:p-4">
                    <div className="space-y-3 md:space-y-4">
                      {availableSurveys.length === 0 ? (
                        <div className="text-center py-6 md:py-8">
                          <p className="text-muted-foreground mb-4 text-sm md:text-base">
                            {userProgress.surveysCompletedToday >= (currentPlan?.dailySurvey || 0) 
                              ? "You've completed all surveys for today! Come back tomorrow." 
                              : "No surveys available for your current plan. Consider upgrading!"}
                          </p>
                          {userProgress.surveysCompletedToday < (currentPlan?.dailySurvey || 0) && (
                            <Button variant="outline" onClick={() => window.location.href = '/plans'}>
                              View Plans
                            </Button>
                          )}
                        </div>
                      ) : (
                        availableSurveys.map((survey) => (
                          <div key={survey.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-background space-y-3 md:space-y-0">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm md:text-base">{survey.title}</h4>
                              <p className="text-xs md:text-sm text-muted-foreground mb-2">{survey.description}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                <span>⏱️ {survey.duration}</span>
                                <Badge variant="secondary" className="text-xs">{survey.category}</Badge>
                                <Badge variant={survey.difficulty === "Easy" ? "default" : "secondary"} className="text-xs">
                                  {survey.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Requires {survey.requiredPlan}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-3">
                              <div className="text-right">
                                <div className="font-bold text-primary text-sm md:text-base">KSh {survey.reward}</div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-gradient-primary hover:opacity-90 text-xs md:text-sm px-3 md:px-4"
                                onClick={() => {
                                  if (userProgress.surveysCompletedToday >= (currentPlan?.dailySurvey || 0)) {
                                    setShowLimitModal(true);
                                  } else {
                                    handleStartSurvey(survey.id);
                                  }
                                }}
                              >
                                {userProgress.surveysCompletedToday >= (currentPlan?.dailySurvey || 0) ? 'Limit Reached' : 'Start Survey'}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page 2: Activity & Withdrawal - Mobile Optimized */}
            <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/20">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Activity & Earnings</h2>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Track your progress and manage withdrawals
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Recent Activity - Mobile Optimized */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Award className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Your latest surveys and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 md:p-6">
                    <div className="max-h-64 md:max-h-80 overflow-y-auto border border-border/50 rounded-lg bg-muted/20 p-2 md:p-4">
                      <div className="space-y-3 md:space-y-4">
                        {userProgress.completedSurveys.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6 md:py-8 text-sm">No surveys completed yet</p>
                        ) : (
                          userProgress.completedSurveys.slice(-5).map((surveyId, index) => {
                            const survey = surveyData.surveys.find(s => s.id === surveyId);
                            if (!survey) return null;
                            
                            return (
                              <div key={surveyId} className="flex flex-col space-y-2 p-2 md:p-3 bg-background rounded border">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-xs md:text-sm">{survey.title}</p>
                                    <p className="text-xs text-muted-foreground">Recently completed</p>
                                  </div>
                                  <Badge variant="default" className="text-xs">
                                    Completed
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs md:text-sm font-semibold text-success">KSh {survey.reward}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Withdrawal Container */}
                <WithdrawalContainer />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
