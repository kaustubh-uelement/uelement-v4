// shared/cbom.ts
// Single CycloneDX 1.6 CBOM structure validator

export const CDX_COMPONENT_TYPES = [
  'application', 'framework', 'library', 'container', 'platform',
  'operating-system', 'device', 'device-driver', 'firmware', 'file',
  'machine-learning-model', 'data', 'cryptographic-asset',
] as const;

export function validateCycloneDxCbomStructure(cbom: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!cbom || typeof cbom !== 'object') return { valid: false, errors: ['CBOM object is null or undefined'] };
  const c = cbom as Record<string, unknown>;
  if (c['bomFormat'] !== 'CycloneDX') errors.push(`Expected bomFormat to be 'CycloneDX', got '${String(c['bomFormat'])}'`);
  if (c['specVersion'] !== '1.6') errors.push(`Expected specVersion '1.6', got '${String(c['specVersion'])}'`);
  const serial = c['serialNumber'] as unknown;
  if (!serial || typeof serial !== 'string' || !serial.startsWith('urn:uuid:')) {
    errors.push(`Invalid serialNumber format: ${String(serial)}`);
  } else {
    const uuidPart = serial.slice('urn:uuid:'.length);
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuidPart)) {
      errors.push(`Invalid serialNumber UUID format: ${String(serial)}`);
    }
  }
  if (typeof c['version'] !== 'number' || (c['version'] as number) < 1) errors.push(`Invalid version: ${String(c['version'])}`);
  const metadata = c['metadata'] as Record<string, unknown> | undefined;
  if (!metadata || typeof metadata['timestamp'] !== 'string') {
    errors.push('Missing metadata.timestamp');
  } else if (Number.isNaN(Date.parse(metadata['timestamp'] as string))) {
    errors.push(`Invalid metadata.timestamp: ${String(metadata['timestamp'])}`);
  }
  const tools = metadata?.['tools'] as unknown;
  if (!Array.isArray(tools) || (tools as unknown[]).length === 0) errors.push('Missing metadata.tools');
  else {
    (tools as Record<string, unknown>[]).forEach((t, i) => {
      if (!t['vendor'] || !t['name']) errors.push(`metadata.tools[${i}] missing vendor/name`);
    });
  }
  const compMeta = metadata?.['component'] as Record<string, unknown> | undefined;
  if (!compMeta || typeof compMeta['name'] !== 'string' || !compMeta['name']) errors.push('Missing metadata.component.name');
  if (!compMeta || !CDX_COMPONENT_TYPES.includes(String(compMeta['type']) as any)) {
    errors.push(`metadata.component.type '${String(compMeta?.['type'])}' is not a valid CycloneDX 1.6 component type`);
  }
  const components = c['components'] as unknown;
  if (!Array.isArray(components) || (components as unknown[]).length === 0) {
    errors.push('CBOM must contain non-empty components array');
  } else {
    (components as Record<string, unknown>[]).forEach((comp, i) => {
      if (!comp['bomRef'] || typeof comp['bomRef'] !== 'string') errors.push(`Component index ${i} missing bomRef`);
      if (!comp['name'] || typeof comp['name'] !== 'string') errors.push(`Component index ${i} missing name`);
      if (comp['type'] !== 'cryptographic-asset') errors.push(`Component index ${i} type must be 'cryptographic-asset', got '${String(comp['type'])}'`);
      const cp = comp['cryptoProperties'] as Record<string, unknown> | undefined;
      if (!cp) errors.push(`Component index ${i} missing cryptoProperties`);
      else {
        const assetType = cp['assetType'] as string | undefined;
        if (!['algorithm', 'certificate', 'protocol'].includes(String(assetType))) {
          errors.push(`Component index ${i} invalid cryptoProperties.assetType: ${String(assetType)}`);
        }
        if (assetType === 'algorithm' && !cp['algorithmProperties']) errors.push(`Component index ${i} missing algorithmProperties for assetType algorithm`);
        if (assetType === 'certificate' && !cp['certificateProperties']) errors.push(`Component index ${i} missing certificateProperties for assetType certificate`);
        if (assetType === 'protocol' && !cp['protocolProperties']) errors.push(`Component index ${i} missing protocolProperties for assetType protocol`);
      }
      if (!comp['quantumVulnerability'] || typeof comp['quantumVulnerability'] !== 'object') {
        errors.push(`Component index ${i} missing quantumVulnerability object`);
      } else {
        const qv = comp['quantumVulnerability'] as Record<string, unknown>;
        if (typeof qv['quantumSecurityLevel'] !== 'number') errors.push(`Component index ${i} quantumVulnerability.quantumSecurityLevel must be number`);
        if (typeof qv['shorRisk'] !== 'boolean') errors.push(`Component index ${i} quantumVulnerability.shorRisk must be boolean`);
        if (typeof qv['groverRisk'] !== 'boolean') errors.push(`Component index ${i} quantumVulnerability.groverRisk must be boolean`);
      }
    });
  }
  const deps = c['dependencies'] as unknown;
  if (!Array.isArray(deps)) errors.push('Missing dependencies array');
  else {
    (deps as Record<string, unknown>[]).forEach((d, i) => {
      if (!d['ref'] || typeof d['ref'] !== 'string') errors.push(`dependencies[${i}] missing ref`);
      if (!Array.isArray(d['dependsOn'])) errors.push(`dependencies[${i}] dependsOn must be array`);
    });
  }
  return { valid: errors.length === 0, errors };
}
