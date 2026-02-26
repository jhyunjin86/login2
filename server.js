// .env 파일에서 환경변수 로드
require('dotenv').config();

// express 불러오기
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// express 앱 생성
const app = express();
// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// 포트 설정 (환경변수 있으면 사용, 없으면 3000)
const PORT = process.env.PORT || 3000;

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행됨: http://localhost:${PORT}`);
});

// index.html 파일을 정적 파일로 제공
app.use(express.static('client'));

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
.then(async() =>{
    console.log('MongoDB 연결 성공')
    // 데이터베이스 데이터 생성 test
    const User = require('./models/User');

    // const hashed = await bcrypt.hash('testpassword', 10);
    // const testUser = new User({
    //     username: 'aaa',
    //     // password: 'testpassword',
    //     password: hashed,
    //   });

    // await testUser.save();
    // console.log('테스트 사용자 저장됨:', testUser);
})
.catch((err) => console.error('MongoDB 연결 실패:', err));

// 라우터 설정
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

//
const protectedRoutes = require('./routes/protected');
app.use('/user', protectedRoutes);

