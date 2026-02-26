const  express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//
router.post('/register', async (req, res) => {

    const { username, password } = req.body;

    // id chk
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }
    // pwd hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // save
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: '회원가입 성공' });
});

// 로그인 라우터
router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    // id chk
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // pwd chk
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // // jwt 생성
    // const token = jwp.sign({ userId: user._id, userName: user.username }, process.env.ACCESS_SECRET, { expiresIn: '15m' });

    // res.json({ message: '로그인 성공', token });

    // Access Token
    const accessToken = jwt.sign({ userId: user._id, userName: user.username }, process.env.ACCESS_SECRET, { expiresIn: '1m' });

    // Refresh Token
    const refreshToken = jwt.sign({ userId: user._id, userName: user.username }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // MongoDB에 저장
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });

});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token이 없습니다.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // MongoDB에서 사용자 조회
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "토큰 불일치" });
    }
//test
console.log("user.refreshToken:", user.refreshToken);

    // 새로운 Access Token 생성
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, userName: decoded.userName },
      process.env.ACCESS_SECRET,
      { expiresIn: '2m' }
    );

    // 새로운 Refresh Token 생성 (선택 사항)
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, userName: decoded.userName },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

//test
console.log("newRefreshToken:", newRefreshToken);

    // MongoDB에 새로운 Refresh Token 저장
    user.refreshToken = newRefreshToken;
    await user.save();

    // 클라이언트에 새로운 Access Token과 Refresh Token 반환
    res.json({ accessToken: newAccessToken });

  // } catch (err) {
  //   return res.status(403).json({ message: 'Refresh Token이 유효하지 않습니다.' });
  } catch (err) {
    console.log("refresh 에러:", err.message);
    return res.status(403).json({
      message: err.message
    });
  }
});

//
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh Token이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "토큰 불일치" });
        }
        user.refreshToken = null;
        await user.save();
        res.json({ message: '로그아웃 성공' });
    } catch (err) {
        console.log("logout 에러:", err.message);
        return res.status(403).json({
            message: err.message
        });
    }
});

// 라우터 모듈 내보내기
module.exports = router;