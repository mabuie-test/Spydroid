const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

UserSchema.pre('save', async function() {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function(pw) {
  return bcrypt.compare(pw, this.password);
};

module.exports = mongoose.model('User', UserSchema);
