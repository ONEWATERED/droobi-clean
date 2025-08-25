import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;
let initialized = false;

export function bootOtel(): void {
  // Only initialize once
  if (initialized) {
    return;
  }
  
  initialized = true;

  // Skip if no OTLP endpoint configured
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    console.log('OpenTelemetry: Skipped (no OTEL_EXPORTER_OTLP_ENDPOINT)');
    return;
  }

  try {
    // Parse headers if provided
    const headers: Record<string, string> = {};
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      const headerPairs = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',');
      headerPairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          headers[key.trim()] = value.trim();
        }
      });
    }

    // Create OTLP trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers,
    });

    // Create resource with service information
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME_API || 'droobi-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.SENTRY_ENVIRONMENT || 'development',
    });

    // Initialize SDK
    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable some noisy instrumentations in development
          '@opentelemetry/instrumentation-fs': {
            enabled: process.env.NODE_ENV === 'production',
          },
        }),
      ],
    });

    // Start the SDK
    sdk.start();
    console.log('OpenTelemetry: Started successfully');
  } catch (error) {
    console.error('OpenTelemetry: Failed to initialize:', error);
  }
}

export function shutdownOtel(): Promise<void> {
  if (sdk) {
    return sdk.shutdown();
  }
  return Promise.resolve();
}