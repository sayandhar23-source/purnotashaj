import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';

function normalize(s: string) {
  return (s || '').trim().toLowerCase();
}

function formatDateRange(minDate: Date, maxDate: Date): string {
  const minDay = minDate.getDate();
  const maxDay = maxDate.getDate();
  const minMonth = minDate.toLocaleString('en-US', { month: 'long' });
  const maxMonth = maxDate.toLocaleString('en-US', { month: 'long' });
  if (minMonth === maxMonth) return `${minDay}–${maxDay} ${minMonth}`;
  return `${minDay} ${minMonth} – ${maxDay} ${maxMonth}`;
}

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(StoreSettings.name) private settingsModel: Model<StoreSettingsDocument>,
  ) {}

  async getEstimate(pincode: string) {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      throw new BadRequestException('Enter a valid 6-digit Indian pincode.');
    }

    let lookup: any;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      lookup = Array.isArray(data) ? data[0] : data;
    } catch {
      throw new BadRequestException('Could not verify that pincode right now. Please try again shortly.');
    }

    if (!lookup || lookup.Status !== 'Success' || !lookup.PostOffice?.length) {
      throw new BadRequestException("That doesn't look like a valid pincode — please double-check it.");
    }

    const office = lookup.PostOffice[0];
    const state: string = office.State;
    const district: string = office.District;

    const settings = await this.settingsModel.findOne();
    const originState = settings?.shippingOriginState ?? 'West Bengal';
    const remoteStates = settings?.remoteStates ?? [];

    let minDays: number;
    let maxDays: number;
    let zoneLabel: string;

    if (remoteStates.some((s) => normalize(s) === normalize(state))) {
      minDays = settings?.remoteDeliveryMinDays ?? 12;
      maxDays = settings?.remoteDeliveryMaxDays ?? 15;
      zoneLabel = 'remote area';
    } else if (normalize(state) === normalize(originState)) {
      minDays = settings?.sameStateDeliveryMinDays ?? 3;
      maxDays = settings?.sameStateDeliveryMaxDays ?? 6;
      zoneLabel = 'within state';
    } else {
      minDays = settings?.otherStateDeliveryMinDays ?? 7;
      maxDays = settings?.otherStateDeliveryMaxDays ?? 10;
      zoneLabel = 'other states';
    }

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    return {
      pincode,
      district,
      state,
      zoneLabel,
      minDays,
      maxDays,
      estimatedDateRange: formatDateRange(minDate, maxDate),
    };
  }
}
