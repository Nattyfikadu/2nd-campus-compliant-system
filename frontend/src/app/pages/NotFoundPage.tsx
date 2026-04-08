import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 flex-col text-center">
            <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <FileQuestion className="size-12 text-gray-500" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900">404 - Page Not Found</h1>
            <p className="text-gray-500 mb-8 max-w-md">
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
