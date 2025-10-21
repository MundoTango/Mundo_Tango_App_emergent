import { CheckCircle2, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function QualityTab() {
  const qualityMetrics = [
    { name: 'Code Quality', score: 92, status: 'excellent', color: 'green' },
    { name: 'Test Coverage', score: 78, status: 'good', color: 'cyan' },
    { name: 'Performance', score: 88, status: 'excellent', color: 'green' },
    { name: 'Accessibility', score: 65, status: 'needs-work', color: 'yellow' },
  ];

  const learnings = [
    { id: 1, title: 'MB.MD Methodology Success', category: 'Process', impact: 'High', date: 'Oct 20, 2025' },
    { id: 2, title: 'React Query Optimization Patterns', category: 'Technical', impact: 'Medium', date: 'Oct 19, 2025' },
    { id: 3, title: 'User Journey Validation Framework', category: 'UX', impact: 'High', date: 'Oct 18, 2025' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          Quality & Learning
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Platform quality metrics and captured learnings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Quality Metrics
            </CardTitle>
            <CardDescription>Overall platform health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qualityMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={metric.status === 'excellent' ? 'default' : metric.status === 'good' ? 'secondary' : 'outline'}
                      className={
                        metric.status === 'excellent' 
                          ? 'bg-green-500' 
                          : metric.status === 'good' 
                          ? 'bg-cyan-500' 
                          : 'bg-yellow-500 text-gray-900'
                      }
                    >
                      {metric.score}%
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Quality Alerts
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Accessibility needs improvement</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">WCAG AA compliance at 65% - target is 90%+</div>
                </div>
              </div>
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                All other quality gates passing ✓
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-cyan-200 dark:border-cyan-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Captured Learnings
          </CardTitle>
          <CardDescription>Knowledge and best practices from Agent #80</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learnings.map((learning) => (
              <div key={learning.id} className="flex items-start gap-3 p-3 rounded bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" data-testid={`learning-${learning.id}`}>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{learning.title}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <Badge variant="outline" className="text-xs">{learning.category}</Badge>
                    <Badge variant={learning.impact === 'High' ? 'default' : 'secondary'} className="text-xs">
                      {learning.impact} Impact
                    </Badge>
                    <span>{learning.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
