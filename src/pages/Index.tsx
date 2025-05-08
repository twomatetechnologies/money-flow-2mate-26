
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, LineChart, Shield, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Take Control of Your <span className="text-primary">Financial Future</span>
            </h1>
            <p className="mb-10 max-w-3xl text-xl text-muted-foreground">
              Money Flow Guardian helps you track, manage, and optimize your investments 
              with powerful insights and easy-to-use tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/stocks">
                  View Investments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Investment Tracking</h3>
              <p className="text-muted-foreground">
                Monitor all your investments in one place with real-time updates and performance metrics.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Financial Security</h3>
              <p className="text-muted-foreground">
                Keep your financial data secure with advanced encryption and privacy controls.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">AI Insights</h3>
              <p className="text-muted-foreground">
                Get personalized financial recommendations powered by advanced analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">Ready to optimize your finances?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Start your journey to financial freedom today.
          </p>
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
