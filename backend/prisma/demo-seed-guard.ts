export const PRODUCTION_DEMO_SEED_CONFIRMATION = 'seed-travelguide-demo';

export function assertDemoSeedAllowed(
  environment: NodeJS.ProcessEnv = process.env,
): void {
  if (environment.DEMO_SEED_ENABLED !== 'true') {
    throw new Error('Set DEMO_SEED_ENABLED=true to run the demo seed');
  }
  if (
    environment.NODE_ENV === 'production' &&
    environment.DEMO_SEED_CONFIRM_PRODUCTION !==
      PRODUCTION_DEMO_SEED_CONFIRMATION
  ) {
    throw new Error(
      `Production demo seed requires DEMO_SEED_CONFIRM_PRODUCTION=${PRODUCTION_DEMO_SEED_CONFIRMATION}`,
    );
  }
}
