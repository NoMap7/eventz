const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the user name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter the email id'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (val) {
        return validator.isEmail(val);
      },
      message: 'Invalid email id. Please enter a valid email id',
    },
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter the password'],
    minlength: [8, 'Password cannot be less than 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match',
    },
    select: false,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'organiser', 'admin'],
    default: 'user',
  },
  following: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  passwordResetToken: String,
  resetTokenExpiresIn: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.verifyPassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedAt;
  }
  return false;
};
//generate a password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// --------------------DOCUMENT MIDDLEWARES
//ENCRYPT THE PASSWORD BEFORE SAVING TO DATABASE
userSchema.pre('save', async function (next) {
  //DO THIS ONLY WHEN PASSWORD CHANGED OR NEWLY CREATED
  try {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //incase there is delay in saving , jwt issue time will be before password change, so user wont be able to log in ,
  next();
});

// ---------------------QUERY MIDDLEWARES
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'following',
    select: '-__v -passwordChangedAt -following -email',
  });
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
