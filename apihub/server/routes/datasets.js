const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
    getDatasets,
    getDataset,
    createDataset,
    uploadDataset,
    updateDataset,
    deleteDataset,
    getDatasetData
} = require('../controllers/datasetController');

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' ||
            file.mimetype === 'text/csv' ||
            file.originalname.endsWith('.json') ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON and CSV files are allowed'), false);
        }
    }
});

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dataset routes
router.get('/', getDatasets);
router.get('/:id', getDataset);
router.get('/:id/data', getDatasetData);
router.post('/', createDataset);
router.post('/upload', upload.single('file'), uploadDataset);
router.put('/:id', updateDataset);
router.delete('/:id', deleteDataset);

module.exports = router;
