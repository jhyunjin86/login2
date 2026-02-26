const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// 보호된 라우터
router.get('/profile', authMiddleware, (req, res) => {
    res.json({
        message: `사용자 ID: ${req.userName} 프로필 정보입니다.`,
        user: req.userName
    });
});

module.exports = router;