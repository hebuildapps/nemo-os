import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const requiredEnv = [
	{ key: "VITE_SUPABASE_URL", value: import.meta.env.VITE_SUPABASE_URL },
	{ key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
];

const missingEnv = requiredEnv.filter((entry) => !entry.value);

if (missingEnv.length > 0) {
	root.render(
		<div className="min-h-dvh bg-background px-6 py-10 text-foreground">
			<div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl items-center justify-center">
				<div className="w-full border-2 border-border bg-white p-8">
					<div className="font-pixel text-[11px] leading-[1.8]">NEMO OS SETUP REQUIRED</div>
					<div className="mt-4 text-[13px] leading-[1.7] text-muted-foreground">
						The frontend started, but the required Vite environment variables are missing, so the app cannot connect to Supabase yet.
					</div>
					<div className="mt-6 font-pixel text-[8px] leading-[1.8] text-foreground">MISSING VARIABLES</div>
					<div className="mt-3 border border-border bg-surface2 p-4 font-mono text-[12px] leading-[1.8]">
						{missingEnv.map((entry) => (
							<div key={entry.key}>{entry.key}</div>
						))}
					</div>
					<div className="mt-6 font-pixel text-[8px] leading-[1.8] text-foreground">NEXT STEPS</div>
					<div className="mt-3 border border-border bg-surface2 p-4 font-mono text-[12px] leading-[1.8]">
						<div>1. Copy .env.example to .env</div>
						<div>2. Fill in your Supabase URL and publishable key</div>
						<div>3. Restart bun run dev</div>
					</div>
				</div>
			</div>
		</div>,
	);
} else {
	void import("./App.tsx").then(({ default: App }) => {
		root.render(<App />);
	});
}
