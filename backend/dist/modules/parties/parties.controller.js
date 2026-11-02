import { Router } from 'express';
import { PartiesService } from './parties.service.js';
export const partiesRouter = Router();
// GET /api/parties
partiesRouter.get('/', (req, res) => {
    try {
        const partyType = req.query.type;
        const parties = PartiesService.getAllParties(partyType);
        res.json({ success: true, data: parties });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/parties/:id
partiesRouter.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const party = PartiesService.getPartyById(id);
        res.json({ success: true, data: party });
    }
    catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
});
// POST /api/parties
partiesRouter.post('/', (req, res) => {
    try {
        const newParty = PartiesService.createParty(req.body);
        res.status(201).json({ success: true, data: newParty });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// PUT /api/parties/:id
partiesRouter.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = PartiesService.updateParty(id, req.body);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// DELETE /api/parties/:id
partiesRouter.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        PartiesService.deleteParty(id);
        res.json({ success: true, message: 'Party deleted successfully' });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
