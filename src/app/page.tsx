import GameInterface from '../components/GameInterface';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
            <GameInterface />
        </main>
    );
}
