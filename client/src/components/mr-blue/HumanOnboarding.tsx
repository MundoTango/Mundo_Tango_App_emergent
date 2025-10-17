/**
 * TRACK 1: Human Onboarding Flow
 * Team member registration with role-based agent matching
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next';;
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type UserRole = 'frontend' | 'backend' | 'designer' | 'admin';

interface OnboardingData {
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
}

interface HumanOnboardingProps {
  onComplete?: () => void;
}

const skillsByRole: Record<UserRole, string[]> = {
  frontend: ['React', 'TypeScript', 'CSS', 'HTML', 'Tailwind', 'UI/UX'],
  backend: ['Node.js', 'PostgreSQL', 'API Design', 'TypeScript', 'Express'],
  designer: ['Figma', 'UI Design', 'UX Design', 'Prototyping', 'Aurora Tide'],
  admin: ['Project Management', 'Team Leadership', 'Strategy', 'Analytics']
};

export function HumanOnboarding({ onComplete }: HumanOnboardingProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    email: '',
    role: 'frontend',
    skills: []
  });
  const { toast } = useToast();

  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiRequest('/api/team/onboard', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to the Team! 🎉",
        description: `${data.matchedAgents?.length || 0} agents matched to your role. Check "My Work" tab for assignments.`
      });
      onComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Onboarding Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide name and email",
        variant: "destructive"
      });
      return;
    }
    onboardMutation.mutate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <CardTitle>Welcome New Team Member!</CardTitle>
        </div>
        <CardDescription>
          Let's set you up with the right AI agents for seamless collaboration
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                data-testid="input-onboarding-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sarah Chen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-onboarding-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@company.com"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Primary Role</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as UserRole, skills: [] })}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="frontend" id="frontend" data-testid="radio-role-frontend" />
                  <Label htmlFor="frontend" className="cursor-pointer flex-1">
                    Frontend Engineer
                    <p className="text-xs text-muted-foreground">UI/UX, React, Styling</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="backend" id="backend" data-testid="radio-role-backend" />
                  <Label htmlFor="backend" className="cursor-pointer flex-1">
                    Backend Engineer
                    <p className="text-xs text-muted-foreground">APIs, Database, Logic</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="designer" id="designer" data-testid="radio-role-designer" />
                  <Label htmlFor="designer" className="cursor-pointer flex-1">
                    Designer
                    <p className="text-xs text-muted-foreground">UI/UX, Figma, Design Systems</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="admin" id="admin" data-testid="radio-role-admin" />
                  <Label htmlFor="admin" className="cursor-pointer flex-1">
                    Admin/Manager
                    <p className="text-xs text-muted-foreground">Strategy, Oversight, Analytics</p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label>Skills & Expertise</Label>
            <div className="grid grid-cols-2 gap-2">
              {skillsByRole[formData.role].map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    data-testid={`checkbox-skill-${skill.toLowerCase().replace(/[.\s]/g, '-')}`}
                    checked={formData.skills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <Label htmlFor={skill} className="cursor-pointer text-sm">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">Your AI Agent Team</h4>
                <p className="text-xs text-muted-foreground">
                  Based on your role as <strong>{formData.role}</strong>, you'll be matched with:
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.role === 'frontend' && (
                    <>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">MB6 (Visual Editor)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA2 (Frontend Coord)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA48 (UI/UX)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">P* (Page Agents)</span>
                    </>
                  )}
                  {formData.role === 'backend' && (
                    <>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA1 (Infrastructure)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA3 (Background)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA5 (Business Logic)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">P* (Page Agents)</span>
                    </>
                  )}
                  {formData.role === 'designer' && (
                    <>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">MB6 (Visual Editor)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA11 (Aurora Tide)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA48 (UI/UX)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">P* (Page Agents)</span>
                    </>
                  )}
                  {formData.role === 'admin' && (
                    <>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA9 (Agent Orchestrator)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA60 (Analytics)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA64 (Audit System)</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">ESA65 (The Plan)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={onboardMutation.isPending}
            data-testid="button-submit-onboarding"
          >
            {onboardMutation.isPending ? 'Setting Up...' : 'Join the Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
