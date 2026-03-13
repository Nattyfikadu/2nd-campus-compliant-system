import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col text-center">
            <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <FileQuestion className="size-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                Oops! We couldn't find the page you were looking for. The link might be broken, or the page may have been removed.
            </p>
            <Button asChild size="lg">
                <Link to="/">
                    <Home className="size-4 mr-2" />
                    Back to Home
                </Link>
            </Button>
        </div>
    );
}
