const express = require('express');
const { createSubscription, getSubscriptions, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

router.use(verifyJWT);

router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
