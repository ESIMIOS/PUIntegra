/**
 * @package shared
 * @name puiDomainAdapters.ts
 * @version 0.0.1
 * @description Mapea payloads de transporte PUI a campos internos de dominio.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial de adaptadores PUI-dominio.	@tirsomartinezreyes
 */

import {
	PUI_CASE_ID_REGEX,
	PUI_FASE_BUSQUEDA,
	type PuiFaseBusqueda,
	type PUIInstitucionNotificaCoincidenciaEnPUIPayload,
	type PUIPUIActivaReporteEnInstitucionPayload
} from '../schemas/pui-transport.schema'
import { SEARCH_REQUEST_PHASE, SEARCH_REQUEST_PHASE_STATUS, SEARCH_REQUEST_STATUS, type Request, type SearchRequestPhase } from '../schemas/request.schema'
import { FINDING_PUI_SYNC_STATUS, type Finding } from '../schemas/finding.schema'
import { optionalPuiDateToUtcMilliseconds } from '../utils/puiDateUtils'

/**
 * @description Extracts the functional FUB prefix from a PUI case id.
 */
export function extractFubFromPuiCaseId(caseId: string): string {
	if (!PUI_CASE_ID_REGEX.test(caseId)) {
		throw new Error('PUI case id must follow FUB-UUID4 format.')
	}

	return caseId.slice(0, -37)
}

/**
 * @description Maps an internal search phase to PUI transport phase.
 */
export function toPuiFaseBusqueda(phase: SearchRequestPhase): PuiFaseBusqueda {
	switch (phase) {
		case SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA:
			return PUI_FASE_BUSQUEDA.FASE_1
		case SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL:
			return PUI_FASE_BUSQUEDA.FASE_2
		case SEARCH_REQUEST_PHASE.SEARCH_REQUEST_CONTINUOUS:
			return PUI_FASE_BUSQUEDA.FASE_3
		default:
			throw new Error('Unsupported internal search request phase.')
	}
}

/**
 * @description Maps a PUI transport phase to the internal search phase.
 */
export function fromPuiFaseBusqueda(phase: PuiFaseBusqueda): SearchRequestPhase {
	switch (phase) {
		case PUI_FASE_BUSQUEDA.FASE_1:
			return SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA
		case PUI_FASE_BUSQUEDA.FASE_2:
			return SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL
		case PUI_FASE_BUSQUEDA.FASE_3:
			return SEARCH_REQUEST_PHASE.SEARCH_REQUEST_CONTINUOUS
		default:
			throw new Error('Unsupported PUI search phase.')
	}
}

/**
 * @description Derives internal request creation data from a PUI activation payload.
 */
export function puiActivationPayloadToRequestCreateData(payload: PUIPUIActivaReporteEnInstitucionPayload, RFC: string, now: number): Request {
	return {
		requestId: payload.id,
		RFC,
		FUB: extractFubFromPuiCaseId(payload.id),
		CURP: payload.curp,
		missingDate: optionalPuiDateToUtcMilliseconds(payload.fecha_desaparicion),
		searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
		searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
		searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
		searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
		updates: [],
		createdAt: now,
		updatedAt: now,
		data: payload
	}
}

/**
 * @description Derives internal finding creation data from a PUI match payload.
 */
export function puiMatchPayloadToFindingCreateData(payload: PUIInstitucionNotificaCoincidenciaEnPUIPayload, RFC: string, findingId: string, now: number): Finding {
	return {
		findingId,
		RFC,
		FUB: extractFubFromPuiCaseId(payload.id),
		CURP: payload.curp,
		searchRequestPhase: fromPuiFaseBusqueda(payload.fase_busqueda),
		PUISyncStatus: FINDING_PUI_SYNC_STATUS.PENDING,
		PUISyncScheduleDate: null,
		responses: [],
		updates: [],
		createdAt: now,
		updatedAt: now,
		data: payload
	}
}
