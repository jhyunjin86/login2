const moongoose = require('mongoose');

// User 스키마 정의
const userSchema = new moongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: {type: String}
});

// User 모델 생성
const Users = moongoose.model('Users', userSchema);
module.exports = Users;

