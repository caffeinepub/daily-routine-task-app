import { useGetAllTasks } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Target, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ProgressView() {
  const { data: tasks = [] } = useGetAllTasks();

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
      pending: total - completed,
    };
  }, [tasks]);

  // Generate weekly data based on task completion
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const currentDayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to Sunday=6
    
    // For demo purposes, generate sample data with current day showing actual completion
    return days.map((day, index) => {
      if (index === currentDayIndex) {
        return {
          day,
          completed: stats.completed,
          total: stats.total,
        };
      }
      // Generate sample data for other days (this would come from backend in production)
      const sampleTotal = Math.floor(Math.random() * 5) + 3;
      const sampleCompleted = Math.floor(Math.random() * sampleTotal);
      return {
        day,
        completed: sampleCompleted,
        total: sampleTotal,
      };
    });
  }, [stats.completed, stats.total]);

  const chartConfig = {
    completed: {
      label: 'Completed',
      color: 'hsl(var(--chart-1))',
    },
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
        <p className="text-muted-foreground">Track your daily achievements and build momentum</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active tasks today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{stats.percentage}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Tasks remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">0</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Completion</CardTitle>
          <CardDescription>Your progress for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{stats.completed} / {stats.total} tasks</span>
            </div>
            <Progress value={stats.percentage} className="h-3" />
          </div>
          
          {stats.percentage === 100 && stats.total > 0 && (
            <div className="rounded-lg bg-chart-1/10 p-4 text-center">
              <p className="text-sm font-medium text-chart-1">🎉 Amazing! You've completed all tasks today!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Tasks completed each day this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="completed" 
                  fill="var(--color-completed)" 
                  radius={[8, 8, 0, 0]}
                  name="Completed"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Completed Tasks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Breakdown */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Overview of your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id.toString()} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {task.completed ? (
                      <span className="inline-flex items-center rounded-full bg-chart-1/10 px-3 py-1 text-xs font-medium text-chart-1">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-chart-3/10 px-3 py-1 text-xs font-medium text-chart-3">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
