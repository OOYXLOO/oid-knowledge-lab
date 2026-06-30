# Premade Plugin Config Case Study

## Context

Plugin installers can expose too many low-level configuration decisions to a new partner. A better first-run experience is to offer named premade configurations with clear metadata, while keeping custom editing available for teams that already know what they need.

## Patch Shape

The implementation introduces a premade configuration shape:

```ts
interface PremadeConfig {
  metadata: {
    name: string;
    description: string;
    version: string;
  };
  plugins: Record<string, { yamlConfig: string }>;
}
```

The existing predefined plugin set is wrapped as `UbiquityOS Standard Config`, and the selector presents named premade configs plus a `Custom` path.

## Review Notes

This is a small product-experience change. It does not remove custom configuration. It makes the default path clearer by naming the opinionated setup as a premade configuration instead of presenting it as a generic template.

## QA

- Build completed successfully.
- Jest completed successfully.
- Whitespace check completed successfully.

