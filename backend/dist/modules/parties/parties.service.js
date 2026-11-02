import { PartiesRepository } from './parties.repository.js';
export class PartiesService {
    static getAllParties(partyType) {
        return PartiesRepository.findAll(partyType);
    }
    static getPartyById(id) {
        const party = PartiesRepository.findById(id);
        if (!party) {
            throw new Error(`Party with ID ${id} not found.`);
        }
        return party;
    }
    static createParty(input) {
        if (!input.name || input.name.trim().length === 0) {
            throw new Error('Party name is required.');
        }
        if (!input.party_type) {
            throw new Error('Party type is required.');
        }
        return PartiesRepository.create(input);
    }
    static updateParty(id, input) {
        const updated = PartiesRepository.update(id, input);
        if (!updated) {
            throw new Error(`Failed to update party with ID ${id}.`);
        }
        return updated;
    }
    static deleteParty(id) {
        PartiesRepository.delete(id);
    }
}
