import { PartiesRepository } from './parties.repository.js';
import { Party, CreatePartyInput, PartyType } from './parties.types.js';

export class PartiesService {
  static getAllParties(partyType?: PartyType): Party[] {
    return PartiesRepository.findAll(partyType);
  }

  static getPartyById(id: number): Party {
    const party = PartiesRepository.findById(id);
    if (!party) {
      throw new Error(`Party with ID ${id} not found.`);
    }
    return party;
  }

  static createParty(input: CreatePartyInput): Party {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Party name is required.');
    }
    if (!input.party_type) {
      throw new Error('Party type is required.');
    }
    return PartiesRepository.create(input);
  }

  static updateParty(id: number, input: Partial<CreatePartyInput>): Party {
    const updated = PartiesRepository.update(id, input);
    if (!updated) {
      throw new Error(`Failed to update party with ID ${id}.`);
    }
    return updated;
  }

  static deleteParty(id: number): void {
    PartiesRepository.delete(id);
  }
}
