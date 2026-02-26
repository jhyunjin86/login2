const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.userName = decoded.userName;
        next();
    } catch (err) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
};