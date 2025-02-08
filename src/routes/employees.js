import express from 'express';
import bcrypt from 'bcryptjs';
import { adminAuth } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

// Obtenir tous les employés (admin seulement)
router.get('/', adminAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
        .select('-password')
        .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un employé (admin seulement)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
    });

    res.status(201).json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un employé (admin seulement)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = { name, email };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const employee = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un employé (admin seulement)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;