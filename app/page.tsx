import GameInterface from '../components/GameInterface';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
            <ErrorBoundary>
                <GameInterface />
            </ErrorBoundary>
        </main>
    );
}
