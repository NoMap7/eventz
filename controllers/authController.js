const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendMail = require('../utils/email');
const crypto = require('crypto');

const createSendJWT = async (user, statusCode, res) => {
  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '2 days',
  });
  const cookieOptions = {
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //for https

  res.cookie('jwt', token, cookieOptions); //send jwt as cookie

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

exports.signup = async (req, res, next) => {
  try {
    //create user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    //sign jwt and send it to the user
    createSendJWT(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //match user credentials in the database and get the user
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  //verify credentails
  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Invaid email or password', 401));
  }

  //sign and send token to the user
  createSendJWT(user, 200, res);
};

exports.protect = async (req, res, next) => {
  try {
    //check if token was sent as header---------------------------------
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new AppError('You are not logged in. Please log in', 401));
    }

    //verify the token---------------------------------
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    //check if the user has not been deleted
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user does not exist anymore. Please sign up', 401)
      );
    }

    //check if user's password has not been changed after token was issued--(OR send a new jwt after password update)
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'Your password was recently changed. Please log in again',
          401
        )
      );
    }

    //access granted
    req.user = user; //to be used by successive middlewares
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permissions to perform this action', 403)
      );
    }
    next();
  };
};

// exports.forgotPassword = async (req, res, next) => {
//   try {
//     //get user with email
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return next(
//         new AppError('No user exists with the provided email id', 404)
//       );
//     }

//     //generate reset Token and save it in DB
//     const resetToken = user.generateResetToken();
//     await user.save({ validateModifiedOnly: true });

//     //send reset token to user's email
//     const resetUrl = `${req.protocol}://${req.get(
//       'host'
//     )}/users/resetPassword/${resetToken}`;

//     const message = `Forgotten your password?? Please click on the link below to reset your password. This link will be valid only for the next 10 minutes.\n ${resetUrl} \nPlease ingore if you did not request the reset token.`;
//     try {
//       await sendMail({
//         email: user.email,
//         subject: 'Reset your password',
//         message,
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'Password reset link was sent to the email address',
//       });
//     } catch (err) {
//       await user.updateOne({
//         passwordResetToken: undefined,
//         resetTokenExpiresIn: undefined,
//       });
//       return next(
//         new AppError(
//           'There was error sending the reset link. Please try again after some time.',
//           500
//         )
//       );
//     }
//   } catch (err) {
//     next(err);
//   }
// };

exports.forgotPassword = async (req, res, next) => {
  try {
    //get user with email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('No user exists with the provided email id', 404)
      );
    }

    //generate reset Token and save it in DB
    const resetToken = user.generateResetToken();
    console.log(user);
    await user.save({ validateModifiedOnly: true });

    //send reset token to user's email
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/users/resetPassword/${resetToken}`;

    const message = `Forgotten your password?? Please click on the link below to reset your password. This link will be valid only for the next 10 minutes.\n ${resetUrl} \nPlease ingore if you did not request the reset token.`;
    try {
      await sendMail({
        email: user.email,
        subject: 'Reset your password',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset link was sent to the email address',
      });
    } catch (err) {
      await user.updateOne({
        passwordResetToken: undefined,
        resetTokenExpiresIn: undefined,
      });
      return next(
        new AppError(
          'There was error sending the reset link. Please try again after some time.'
        )
      );
    }
  } catch (err) {
    next(err);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    //get user from DB based on the reset token | the reset token stored in DB encrypted using crypto('sha256') |
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      resetTokenExpiresIn: { $gt: Date.now() },
    });
    //if token has not exprired and a user exists, then set the new password
    if (!user) {
      return next(
        new AppError('Invalid reset token or the token has expired', 400)
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.resetTokenExpiresIn = undefined;
    await user.save();

    //update passwordUpdatedAt field for the user
    // added a pre('save') to do this

    //log the user in, send JWT
    createSendJWT(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.updateMyPassword = async (req, res, next) => {
  try {
    //get user from db along with the encrypted password field
    const user = await User.findById(req.user.id).select('+password');
    //check if the current password entered by user is correct
    if (!(await user.verifyPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Incorrect current password.', 401));
    }

    //set new password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    //log user in, sent jwt
    createSendJWT(user, 200, res);
  } catch (err) {
    next(err);
  }
};
