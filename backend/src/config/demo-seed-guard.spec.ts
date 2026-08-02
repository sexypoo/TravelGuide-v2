import {
  assertDemoSeedAllowed,
  PRODUCTION_DEMO_SEED_CONFIRMATION,
} from '../../prisma/demo-seed-guard';

describe('demo seed safety guard', () => {
  it('requires the enable flag in every environment', () => {
    expect(() => assertDemoSeedAllowed({ NODE_ENV: 'development' })).toThrow(
      'DEMO_SEED_ENABLED=true',
    );
  });

  it('requires an explicit phrase in production', () => {
    expect(() =>
      assertDemoSeedAllowed({
        NODE_ENV: 'production',
        DEMO_SEED_ENABLED: 'true',
      }),
    ).toThrow('DEMO_SEED_CONFIRM_PRODUCTION');
    expect(() =>
      assertDemoSeedAllowed({
        NODE_ENV: 'production',
        DEMO_SEED_ENABLED: 'true',
        DEMO_SEED_CONFIRM_PRODUCTION: PRODUCTION_DEMO_SEED_CONFIRMATION,
      }),
    ).not.toThrow();
  });
});
