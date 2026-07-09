import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary fallback view.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Error Boundary Caught]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full glass-panel border border-border/50 p-8 rounded-3xl text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                An unexpected application error occurred. We have logged this diagnostic trace.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-[10px] text-left p-3.5 bg-muted/30 border border-border/40 rounded-xl overflow-auto max-h-32 text-muted-foreground font-mono leading-tight">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload} className="w-full bg-gradient-to-r from-primary to-secondary text-white border-0 font-bold glow-hover h-11 rounded-xl">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
