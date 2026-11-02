import { Router, Request, Response } from 'express';
import { PartiesService } from './parties.service.js';
import { PartyType } from './parties.types.js';

export const partiesRouter = Router();

// GET /api/parties
partiesRouter.get('/', (req: Request, res: Response) => {
  try {
    const partyType = req.query.type as PartyType | undefined;
    const parties = PartiesService.getAllParties(partyType);
    res.json({ success: true, data: parties });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/parties/:id
partiesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const party = PartiesService.getPartyById(id);
    res.json({ success: true, data: party });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/parties
partiesRouter.post('/', (req: Request, res: Response) => {
  try {
    const newParty = PartiesService.createParty(req.body);
    res.status(201).json({ success: true, data: newParty });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/parties/:id
partiesRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = PartiesService.updateParty(id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/parties/:id
partiesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    PartiesService.deleteParty(id);
    res.json({ success: true, message: 'Party deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});
