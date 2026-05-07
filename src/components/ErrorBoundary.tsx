'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="items-center text-center">
              <div className="mb-2 inline-flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle />
              </div>
              <CardTitle>
                Terjadi Kesalahan
              </CardTitle>
              <CardDescription>
                Maaf, terjadi kesalahan yang tidak terduga. Silakan refresh halaman atau coba lagi nanti.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {this.state.error && (
                <details className="text-left">
                  <summary className="mb-2 text-sm font-medium text-foreground">
                    Detail Error
                  </summary>
                  <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw data-icon="inline-start" />
                Refresh Halaman
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
