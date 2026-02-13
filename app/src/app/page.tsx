import GameInterface from '../components/GameInterface';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <GameInterface />
        </main>
    );
}
