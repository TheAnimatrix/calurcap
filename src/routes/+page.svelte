<script lang="ts">
	import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let user: any = null;

	onMount(async () => {
		// Initialize Google Auth
		// GoogleAuth.initialize() is sometimes needed depending on platform/version,
		// but usually safe to call.
		try {
			GoogleAuth.initialize();
		} catch (e) {
			console.warn('GoogleAuth initialization failed (this is expected in browser if not configured):', e);
		}

		// Check current session
		const { data } = await supabase.auth.getSession();
		user = data.session?.user;

		supabase.auth.onAuthStateChange((_event, session) => {
			user = session?.user;
		});
	});

	async function signInWithGoogle() {
		try {
			const googleUser = await GoogleAuth.signIn();
			// The plugin returns an authentication object with idToken
			const idToken = googleUser.authentication.idToken;

			const { data, error } = await supabase.auth.signInWithIdToken({
				provider: 'google',
				token: idToken
			});

			if (error) throw error;
			console.log('Signed in:', data);
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		await GoogleAuth.signOut();
	}
</script>

<div class="relative min-h-screen overflow-hidden selection:bg-sky-500/30">
	<!-- Grid Background -->
	<div
		class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
	></div>
	<div
		class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-sky-500 opacity-20 blur-[100px]"
	></div>

	<div class="relative flex min-h-screen flex-col items-center justify-center px-6">
		<div class="w-full max-w-[400px] space-y-12">
			<!-- Header -->
			<div class="space-y-4 text-center">
				<h1
					class="text-5xl font-extrabold tracking-tighter text-white sm:text-6xl"
				>
					Calurcap.
				</h1>
				<p class="text-lg font-medium text-slate-400">
					Rapidly build cross-platform apps.
				</p>
			</div>

			<!-- Content -->
			<div class="space-y-6">
				{#if user}
					<!-- Logged In State -->
					<div
						class="group relative overflow-hidden rounded-2xl bg-slate-800/50 p-6 ring-1 ring-white/10 transition-all hover:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-lg font-bold text-white"
							>
								{user.email?.[0].toUpperCase()}
							</div>
							<div class="flex-1 overflow-hidden">
								<p class="truncate text-sm font-medium text-slate-400">Signed in as</p>
								<p class="truncate text-base font-semibold text-white">{user.email}</p>
							</div>
						</div>
					</div>

					<button
						onclick={signOut}
						class="flex w-full items-center justify-center rounded-full bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
					>
						Sign Out
					</button>
				{:else}
					<!-- Logged Out State -->
					<div class="space-y-4">
						<button
							onclick={signInWithGoogle}
							class="group relative flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-slate-900 transition-all hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]"
						>
							<svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							<span class="font-bold">Sign in with Google</span>
						</button>
						
						<p class="text-center text-xs text-slate-500">
							By clicking continue, you agree to our <span class="hover:text-slate-300 underline decoration-slate-600 underline-offset-4 cursor-pointer">Terms of Service</span> and <span class="hover:text-slate-300 underline decoration-slate-600 underline-offset-4 cursor-pointer">Privacy Policy</span>.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
