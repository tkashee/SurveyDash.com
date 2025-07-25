import { useState, useEffect } from "react";
import { X, TrendingUp, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import "@/styles/survey-limit-moving-colors.css";
import "@/styles/survey-limit-enhanced.css";
import "@/styles/survey-limit-transparent-bg.css";

interface SurveyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
  dailyLimit: number;
  surveysCompletedToday: number;
}

const SurveyLimitModal = ({ 
  isOpen, 
  onClose, 
  currentPlanName, 
  dailyLimit, 
  surveysCompletedToday 
}: SurveyLimitModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setProgress((surveysCompletedToday / dailyLimit) * 100), 100);
    } else {
      setTimeout(() => setIsVisible(false), 300);
      setProgress(0);
    }
  }, [isOpen, surveysCompletedToday, dailyLimit]);

  const handleUpgrade = () => {
    window.location.href = '/plans';
  };

  if (!isVisible) return null;

  const remainingSurveys = Math.max(0, dailyLimit - surveysCompletedToday);
  const isLimitReached = surveysCompletedToday >= dailyLimit;

  return (
    <div className={cn(
      "survey-limit-small-modal",
      isOpen ? "opacity-100" : "opacity-0"
    )}>
      <div className="survey-limit-backdrop" />
      
      {/* Enhanced moving background */}
      <div className="survey-limit-enhanced-bg" />
      <div className="survey-limit-enhanced-overlay" />
      
      <Card className={cn(
        "survey-limit-small-card survey-limit-enhanced-fonts survey-limit-glow",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="survey-limit-lock-icon relative w-10 h-10 rounded-full flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
          <div>
            <CardTitle className="title">
              {isLimitReached ? "Survey Limit" : "Daily Progress"}
            </CardTitle>
            <CardDescription className="subtitle">
              {isLimitReached ? "Upgrade for unlimited surveys" : `${remainingSurveys} left today`}
            </CardDescription>
          </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Progress Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200">Daily Progress</span>
              <span className="text-white">{surveysCompletedToday}/{dailyLimit}</span>
            </div>
            <div className="survey-limit-compact-progress">
              <div 
                className="survey-limit-compact-progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="flex justify-between">
              <span className="text-xs text-slate-300">Plan</span>
              <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0">
                {currentPlanName}
              </Badge>
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Limit</span>
                <span className="text-white">{dailyLimit}/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Completed</span>
                <span className="text-white">{surveysCompletedToday}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={onClose}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyLimitModal;
