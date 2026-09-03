import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LicenseRepository } from './license.repository';
import { normalizeModules, OmniposModuleFlags } from '../common/modules';
import { schemaIdForLicenseKey } from '../common/database-mode';
import { LicenseRecord } from './license.types';

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `OMNI-${segment()}-${segment()}-${segment()}`;
}

@Injectable()
export class LicenseService {
  constructor(private readonly licenses: LicenseRepository) {}

  async activate(body: { key?: string; hwid?: string; deviceName?: string }) {
    const { key, hwid, deviceName } = body;
    if (!key || !hwid) {
      return { status: 400 as const, body: { ok: false, error: 'key and hwid are required' } };
    }

    let license = await this.licenses.findByKey(key);
    if (!license) {
      return { status: 403 as const, body: { ok: false, error: 'License key not found.' } };
    }

    if (!license.isEnabled) {
      return { status: 403 as const, body: { ok: false, error: 'License invalid or disabled.' } };
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await this.licenses.saveFlags(license.id, { isEnabled: false });
      return { status: 403 as const, body: { ok: false, error: 'License has expired.' } };
    }

    const isAlreadyActive = license.activeDevices.some((dev) => dev.hwid === hwid);
    if (!isAlreadyActive) {
      if (license.activeDevices.length >= license.maxDevices) {
        return { status: 400 as const, body: { ok: false, error: `Maximum devices limit (${license.maxDevices}) reached.` } };
      }
      await this.licenses.addDevice(license.id, hwid, deviceName || 'Unknown PC');
      license = (await this.licenses.findById(license.id))!;
    }

    const schemaId = license.schemaId || schemaIdForLicenseKey(license.key);
    if (!license.schemaId) {
      await this.licenses.saveFlags(license.id, { schemaId });
    }

    return {
      status: 200 as const,
      body: {
        ok: true,
        message: 'License active!',
        key: license.key,
        userName: license.userName,
        expiresAt: license.expiresAt ?? null,
        modules: normalizeModules(license.modules),
        databaseMode: 'online' as const,
        schemaId,
      },
    };
  }

  async validate(body: { key?: string; hwid?: string }) {
    const { key, hwid } = body;
    if (!key || !hwid) {
      return { status: 400 as const, body: { ok: false, error: 'key and hwid are required' } };
    }

    const invalid = (error: string, code?: 'not_found' | 'disabled' | 'expired' | 'device') => ({
      status: 200 as const,
      body: {
        ok: true,
        valid: false as const,
        error,
        code,
        expiresAt: null,
        modules: null,
      },
    });

    const found = await this.licenses.findByKey(key);
    if (!found) {
      return invalid('License key not found.', 'not_found');
    }

    if (!found.isEnabled) {
      return invalid('This license has been disabled. Contact OmniPos customer support.', 'disabled');
    }

    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await this.licenses.saveFlags(found.id, { isEnabled: false });
      return invalid('License has expired. Contact OmniPos customer support.', 'expired');
    }

    if (!found.activeDevices.some((dev) => dev.hwid === hwid)) {
      return invalid('This device is not activated for this license. Please activate.', 'device');
    }

    const schemaId = found.schemaId || schemaIdForLicenseKey(found.key);

    return {
      status: 200 as const,
      body: {
        ok: true,
        valid: true as const,
        key: found.key,
        userName: found.userName,
        expiresAt: found.expiresAt ?? null,
        modules: normalizeModules(found.modules),
        databaseMode: 'online' as const,
        schemaId,
      },
    };
  }

  async getModules(body: { key?: string }) {
    const { key } = body;
    if (!key) {
      return { status: 400 as const, body: { ok: false, error: 'key is required' } };
    }

    const found = await this.licenses.findByKey(key);
    if (!found) {
      return { status: 403 as const, body: { ok: false, error: 'License key not found.' } };
    }

    if (!found.isEnabled) {
      return { status: 403 as const, body: { ok: false, error: 'License invalid or disabled.' } };
    }

    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await this.licenses.saveFlags(found.id, { isEnabled: false });
      return {
        status: 200 as const,
        body: { ok: false, error: 'License has expired.', expiresAt: found.expiresAt },
      };
    }

    return {
      status: 200 as const,
      body: {
        ok: true,
        modules: normalizeModules(found.modules),
        expiresAt: found.expiresAt ?? null,
      },
    };
  }

  async getSupport() {
    const contact = await this.licenses.getSupportSettings();
    return {
      status: 200 as const,
      body: {
        ok: true,
        phone: contact.phone,
        email: contact.email,
      },
    };
  }

  // ── Admin Management ──────────────────────────────────────────────────────────

  async getAllLicenses(): Promise<LicenseRecord[]> {
    return await this.licenses.findAll();
  }

  async createLicense(body: {
    userName: string;
    whatsappNumber: string;
    maxDevices?: number;
    licenseType?: string;
    modules?: Partial<OmniposModuleFlags>;
    expiresAt?: string | null;
  }) {
    if (!body.userName || !body.whatsappNumber) {
      throw new BadRequestException('userName and whatsappNumber are required');
    }

    let key = generateKey();
    while (await this.licenses.existsKey(key)) {
      key = generateKey();
    }

    const license = await this.licenses.create({
      key,
      userName: body.userName,
      whatsappNumber: body.whatsappNumber,
      isEnabled: true,
      maxDevices: body.maxDevices || 4,
      licenseType: body.licenseType || 'annual',
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      modules: normalizeModules(body.modules),
      schemaId: schemaIdForLicenseKey(key),
    });

    return { success: true, message: 'License created successfully', data: license };
  }

  async toggleLicense(id: string) {
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const updated = await this.licenses.saveFlags(id, { isEnabled: !license.isEnabled });
    return {
      success: true,
      message: `License ${updated!.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: updated,
    };
  }

  async updateModules(id: string, modules?: Partial<OmniposModuleFlags>) {
    if (!modules || typeof modules !== 'object') {
      throw new BadRequestException('modules object is required');
    }
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const merged = normalizeModules({ ...license.modules, ...modules });
    const updated = await this.licenses.saveFlags(id, { modules: merged });

    return {
      success: true,
      message: 'Modules updated successfully',
      data: updated,
    };
  }

  async removeDevice(id: string, hwid: string) {
    if (!hwid) throw new BadRequestException('hwid is required');
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const removed = await this.licenses.removeDevice(id, hwid);
    if (!removed) throw new NotFoundException('Device not found on this license');

    const updated = await this.licenses.findById(id);
    return {
      success: true,
      message: 'Device unlinked successfully',
      data: updated,
    };
  }
}
