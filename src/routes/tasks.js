import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import Task from '../models/task.js';

const router = express.Router();

// Obtenir toutes les tâches (admin seulement)
router.get('/', adminAuth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les tâches d'un employé
router.get('/employee/:id', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
        .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une tâche (admin seulement)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;
    const task = await Task.create({
      title,
      description,
      assignedTo,
      status: status || 'pending'
    });
    const populatedTask = await task.populate('assignedTo', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour une tâche (admin seulement)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, assignedTo, status },
        { new: true }
    ).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'une tâche
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    ).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une tâche (admin seulement)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;