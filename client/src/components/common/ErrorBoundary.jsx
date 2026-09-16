import { Component } from 'react';
import Button from '../ui/Button.jsx';

/**
 * Last-resort error screen: if any page crashes at runtime the user sees a
 * friendly card (with reload) instead of a blank white page.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="card w-full max-w-md p-7 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-red-600">Something went wrong</p>
          <h1 className="mt-2 text-[20px] font-bold text-ink">The page hit an unexpected error</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Your notes are safe. Reload the page to continue - if this keeps happening, note the details below and report them.
          </p>
          <pre className="mt-4 max-h-[120px] overflow-auto rounded-xl bg-slate-100 p-3 text-left text-[11px] text-ink-muted">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
