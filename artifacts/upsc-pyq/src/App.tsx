import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Shell } from '@/components/layout/shell';
import Home from '@/pages/home';
import SubjectDetail from '@/pages/subject-detail';
import TestMode from '@/pages/test-mode';
import TestResults from '@/pages/test-results';
import PrelimsIndex from '@/pages/prelims-index';
import PrelimsYear from '@/pages/prelims-year';
import PrelimsTest from '@/pages/prelims-test';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth-context';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/subject/:slug" component={SubjectDetail} />
        <Route path="/test/:slug" component={TestMode} />
        <Route path="/test/:slug/results" component={TestResults} />
        <Route path="/prelims" component={PrelimsIndex} />
        <Route path="/prelims/:year" component={PrelimsYear} />
        <Route path="/prelims/:year/test" component={PrelimsTest} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
