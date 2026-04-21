import { z } from 'zod'
import type { IntegrationId, SyncPreview } from '../types/domain'

export const SYNC_ENDPOINT =
  'https://portier-takehometest.onrender.com/api/v1/data/sync'

const syncResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  data: z.object({
    sync_approval: z.object({
      application_name: z.string(),
      changes: z.array(
        z.object({
          id: z.string(),
          field_name: z.string(),
          change_type: z.enum(['ADD', 'UPDATE', 'DELETE']),
          current_value: z.string().nullable().optional(),
          new_value: z.string().nullable().optional(),
        }),
      ),
    }),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
})

const errorResponseSchema = z
  .object({
    code: z.string().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough()

export class SyncApiError extends Error {
  status: number
  title: string
  detail: string

  constructor(
    message: string,
    status: number,
    title: string,
    detail: string,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause })
    this.status = status
    this.title = title
    this.detail = detail
  }
}

export async function fetchSyncPreview(
  applicationId: IntegrationId,
): Promise<SyncPreview> {
  let response: Response
  try {
    response = await fetch(
      `${SYNC_ENDPOINT}?application_id=${encodeURIComponent(applicationId)}`,
    )
  } catch (cause) {
    throw new SyncApiError(
      'Network request failed',
      0,
      'Cannot reach sync service',
      'The browser could not reach the sync API. Check your connection and retry.',
      cause,
    )
  }

  if (!response.ok) {
    const payload = await parseErrorResponse(response)
    throw createSyncApiError(response.status, payload)
  }

  let rawJson: unknown
  try {
    rawJson = await response.json()
  } catch (cause) {
    throw new SyncApiError(
      'Sync response was not valid JSON',
      response.status,
      'Unexpected sync response',
      'The sync API returned a response we could not parse. Please retry shortly.',
      cause,
    )
  }

  const parsed = syncResponseSchema.safeParse(rawJson)
  if (!parsed.success) {
    throw new SyncApiError(
      'Sync response failed schema validation',
      response.status,
      'Unexpected sync response shape',
      'The sync API returned data in an unexpected format. Please retry or contact support if it persists.',
      parsed.error,
    )
  }
  const payload = parsed.data

  return {
    integrationId: applicationId,
    applicationName: payload.data.sync_approval.application_name,
    fetchedAt: new Date().toISOString(),
    changes: payload.data.sync_approval.changes.map((change) => ({
      id: change.id,
      fieldName: change.field_name,
      changeType: change.change_type,
      currentValue: change.current_value ?? null,
      newValue: change.new_value ?? null,
    })),
  }
}

async function parseErrorResponse(response: Response) {
  try {
    return errorResponseSchema.parse(await response.json())
  } catch {
    return {}
  }
}

function createSyncApiError(
  status: number,
  payload: Partial<{ code: string; message: string; error: string }>,
) {
  const message = payload.message ?? payload.error ?? 'Unable to load sync preview.'

  switch (status) {
    case 400:
      return new SyncApiError(
        message,
        status,
        'Integration configuration missing',
        payload.message ??
          'The sync request is missing required integration configuration.',
      )
    case 401:
    case 403:
      return new SyncApiError(
        message,
        status,
        'Integration not authorised',
        payload.message ??
          'Credentials for this integration are missing or have expired. Re-authenticate to continue.',
      )
    case 404:
      return new SyncApiError(
        message,
        status,
        'Integration not found',
        payload.message ??
          'The sync API has no record of this integration. Confirm the application id.',
      )
    case 429:
      return new SyncApiError(
        message,
        status,
        'Rate limit reached',
        payload.message ??
          'Too many sync requests have been issued recently. Wait a moment before retrying.',
      )
    case 500:
      return new SyncApiError(
        message,
        status,
        'Provider returned a server error',
        payload.message ??
          'The integration service failed unexpectedly while preparing the preview.',
      )
    case 502:
      return new SyncApiError(
        message,
        status,
        'Integration gateway unavailable',
        payload.message ??
          'The upstream integration client is temporarily unavailable.',
      )
    case 503:
    case 504:
      return new SyncApiError(
        message,
        status,
        'Integration temporarily unavailable',
        payload.message ??
          'The provider is overloaded or unreachable. Retry the sync in a moment.',
      )
    default:
      if (status >= 400 && status < 500) {
        return new SyncApiError(
          message,
          status,
          'Sync request rejected',
          payload.message ??
            'The provider rejected the sync request. Verify the integration configuration.',
        )
      }
      if (status >= 500) {
        return new SyncApiError(
          message,
          status,
          'Provider returned a server error',
          payload.message ??
            'The integration service failed unexpectedly. Please retry shortly.',
        )
      }
      return new SyncApiError(
        message,
        status,
        'Unable to load sync preview',
        payload.message ?? 'Please retry the sync preview request in a moment.',
      )
  }
}
