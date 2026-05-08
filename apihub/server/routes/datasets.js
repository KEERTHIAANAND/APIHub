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
        const allowedMimes = [
            'application/json',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedMimes.includes(file.mimetype) ||
            file.originalname.endsWith('.json') ||
            file.originalname.endsWith('.csv') ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON, CSV, and Excel files are allowed'), false);
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
