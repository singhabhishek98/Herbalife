const express = require('express');
const {
  listMembers,
  createMember,
  updateMember,
  deleteMember,
  renewMember
} = require('../controllers/memberController');

const router = express.Router();

router.get('/', listMembers);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.post('/:id/renew', renewMember);

module.exports = router;
