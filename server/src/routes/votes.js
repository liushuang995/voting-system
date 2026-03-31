const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', voteController.stats);
router.get('/', voteController.list);
router.get('/:id', voteController.detail);
router.post('/', voteController.create);
router.put('/:id', voteController.update);
router.delete('/:id', voteController.remove);

module.exports = router;