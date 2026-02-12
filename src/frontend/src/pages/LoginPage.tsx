import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { CheckCircle2, Calendar, Flame, TrendingUp, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Daily Routine
            </h1>
            <p className="text-xl text-muted-foreground">
              Build better habits, one day at a time
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Track Daily Tasks</h3>
                <p className="text-sm text-muted-foreground">Create and manage your daily routine with ease</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-accent/10">
                <Flame className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Build Streaks</h3>
                <p className="text-sm text-muted-foreground">Stay motivated with consecutive completion tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <h3 className="font-semibold">View Progress</h3>
                <p className="text-sm text-muted-foreground">Visualize your productivity with analytics</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-chart-2/10">
                <Calendar className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold">Set Reminders</h3>
                <p className="text-sm text-muted-foreground">Never miss a task with browser notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <div className="bg-card border rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-muted-foreground">
                Sign in to start building your daily routine
              </p>
            </div>

            <button
              onClick={login}
              disabled={isLoggingIn}
              aria-label="Sign in with Internet Identity"
              className="group relative w-full h-14 text-lg font-semibold rounded-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.55_0.22_250)] via-[oklch(0.60_0.20_270)] to-[oklch(0.55_0.22_280)] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] dark:group-hover:shadow-[0_8px_30px_rgba(96,165,250,0.4)]" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>

              {/* Button content */}
              <div className="relative flex items-center justify-center gap-3 text-white">
                {isLoggingIn ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <img 
                      src="/assets/generated/login-icon-transparent.dim_32x32.png" 
                      alt="" 
                      className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
                      aria-hidden="true"
                    />
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                      Sign In
                    </span>
                    <LogIn 
                      className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
