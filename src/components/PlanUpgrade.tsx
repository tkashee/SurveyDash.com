import { useState } from "react";
import { Check, Star, Crown, Zap, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSurveyData, SurveyPlan } from "@/hooks/useSurveyData";

const PlanUpgrade = () => {
  const { toast } = useToast();
  const { planData, surveyData, loading } = useSurveyData();
  const [selectedPlan, setSelectedPlan] = useState<SurveyPlan | null>(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");

  if (loading || !planData || !surveyData) return null;

  const currentPlan = surveyData.userProgress.currentPlan;

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Starter": return <Star className="h-6 w-6" />;
      case "Silver": return <Zap className="h-6 w-6" />;
      case "Gold": return <Crown className="h-6 w-6" />;
      case "Platinum": return <Crown className="h-6 w-6 text-purple-500" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "Starter": return "border-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 hover:from-blue-100/90 hover:to-cyan-100/90";
      case "Silver": return "border-gray-300 bg-gradient-to-br from-gray-50/80 to-slate-50/80 hover:from-gray-100/90 hover:to-slate-100/90";
      case "Gold": return "border-yellow-300 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 hover:from-yellow-100/90 hover:to-orange-100/90";
      case "Platinum": return "border-purple-300 bg-gradient-to-br from-purple-50/80 to-pink-50/80 hover:from-purple-100/90 hover:to-pink-100/90";
      default: return "border-border bg-gradient-to-br from-background to-muted/50";
    }
  };

  const handleUpgrade = (plan: SurveyPlan) => {
    setSelectedPlan(plan);
  };

  const confirmUpgrade = () => {
    if (!selectedPlan) return;
    
    // Simulate payment process
    toast({
      title: "Payment Required",
      description: `To upgrade to ${selectedPlan.planName}, please send KSh ${selectedPlan.price} to Till Number: ${planData.mpesaPaymentDetails.tillNumber} (${planData.mpesaPaymentDetails.tillName})`,
    });
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 relative">
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Survey Plan
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Upgrade your plan to earn more money daily
        </p>
      </div>

      {/* Mobile: Horizontal Scroll, Desktop: Grid */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory horizontal-scroll-container">
          {planData.surveyPlans.map((plan) => (
            <Card 
              key={plan.planName} 
              className={`relative flex-shrink-0 w-72 snap-center transition-all duration-300 hover:shadow-glow plan-card ${
                currentPlan === plan.planName 
                  ? 'ring-2 ring-primary shadow-glow bg-gradient-to-br from-primary/10 via-blue-100/50 to-purple-100/50' 
                  : getPlanColor(plan.planName)
              }`}
            >
              {currentPlan === plan.planName && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-xs">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.planName)}
                </div>
                <CardTitle className="text-lg">{plan.planName}</CardTitle>
                <div className="text-center">
                  <span className="text-2xl font-bold">KSh {plan.price}</span>
                  {plan.price !== "0" && <span className="text-muted-foreground text-sm">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success flex-shrink-0" />
                    <span className="text-xs">{plan.dailySurvey} surveys per day</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success flex-shrink-0" />
                    <span className="text-xs">KSh {plan.earningPerSurvey} per survey</span>
                  </div>
                  
                  {plan.dailyIncome > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="text-xs">Up to KSh {plan.dailyIncome.toLocaleString()} daily</span>
                    </div>
                  )}
                  
                  {plan.monthlyIncome > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="text-xs">Up to KSh {plan.monthlyIncome.toLocaleString()} monthly</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success flex-shrink-0" />
                    <span className="text-xs">Min withdrawal: KSh {plan.minimumWithdrawal.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 text-xs py-2"
                  disabled={currentPlan === plan.planName}
                  onClick={() => handleUpgrade(plan)}
                >
                  {currentPlan === plan.planName ? 'Current Plan' : 
                   plan.price === "0" ? 'Free Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {planData.surveyPlans.map((plan) => (
          <Card 
            key={plan.planName} 
            className={`relative transition-all duration-300 hover:shadow-glow hover:scale-105 ${
              currentPlan === plan.planName 
                ? 'ring-2 ring-primary shadow-glow bg-gradient-to-br from-primary/10 via-blue-100/50 to-purple-100/50' 
                : getPlanColor(plan.planName)
            }`}
          >
            {currentPlan === plan.planName && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.planName)}
              </div>
              <CardTitle className="text-xl">{plan.planName}</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">KSh {plan.price}</span>
                {plan.price !== "0" && <span className="text-muted-foreground">/month</span>}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">{plan.dailySurvey} surveys per day</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">KSh {plan.earningPerSurvey} per survey</span>
                </div>
                
                {plan.dailyIncome > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Up to KSh {plan.dailyIncome.toLocaleString()} daily</span>
                  </div>
                )}
                
                {plan.monthlyIncome > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Up to KSh {plan.monthlyIncome.toLocaleString()} monthly</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">Min withdrawal: KSh {plan.minimumWithdrawal.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={currentPlan === plan.planName}
                onClick={() => handleUpgrade(plan)}
              >
                {currentPlan === plan.planName ? 'Current Plan' : 
                 plan.price === "0" ? 'Free Plan' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.planName}</DialogTitle>
            <DialogDescription>
              Complete your payment to upgrade your plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlan?.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">KSh {selectedPlan?.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Till Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{planData.mpesaPaymentDetails.tillNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => navigator.clipboard.writeText(planData.mpesaPaymentDetails.tillNumber.toString())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Till Name:</span>
                  <span className="font-medium">{planData.mpesaPaymentDetails.tillName}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to M-Pesa menu</li>
                <li>2. Select "Lipa na M-Pesa"</li>
                <li>3. Select "Buy Goods and Services"</li>
                <li>4. Enter Till Number: {planData.mpesaPaymentDetails.tillNumber}</li>
                <li>5. Enter Amount: KSh {selectedPlan?.price}</li>
                <li>6. Complete the transaction</li>
              </ol>
            </div>

            {!showPaymentConfirmation ? (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedPlan(null)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowPaymentConfirmation(true)} 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  I've Made Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Paste M-Pesa Payment Confirmation Message
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Paste your M-Pesa confirmation message here..."
                    value={mpesaMessage}
                    onChange={(e) => setMpesaMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPaymentConfirmation(false);
                      setMpesaMessage("");
                    }} 
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!mpesaMessage.trim()) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Please paste your M-Pesa confirmation message",
                        });
                        return;
                      }
                      setSelectedPlan(null);
                      setShowPaymentConfirmation(false);
                      setMpesaMessage("");
                      toast({
                        title: "Payment Confirmed",
                        description: "Thank you for your payment. Your plan upgrade is being processed.",
                      });
                    }} 
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    Submit Confirmation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanUpgrade;
