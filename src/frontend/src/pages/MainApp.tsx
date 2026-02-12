import { useState } from 'react';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import ProgressView from '../components/ProgressView';
import SettingsView from '../components/SettingsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, TrendingUp, Settings } from 'lucide-react';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <TaskList />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressView />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsView />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-16 py-8 bg-card/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with <span className="text-destructive">♥</span> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
