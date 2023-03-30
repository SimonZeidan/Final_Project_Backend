const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const restaurantSchema = new mongoose.Schema({
    name:{
        type: String,
        required: ['true', 'Please enter the restaurant name'],
        trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
      },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    restaurantImageUrl: {
      type: String
    },
    website: {
        type: String,
        trim: true
    },
    openingHours: {
        type: String
    },
    address: {
        type: String
    },
    passwordChangedAt: Date,
},
{timestamps: true});

restaurantSchema.pre("save", async function (next) {
    try {
      if (!this.isModified("password")) {
        return next();
      }
      this.password = await bcrypt.hash(this.password, 12)
      this.passwordConfirm = undefined;
    } catch (err) {
      console.log(err);
    }
  });

  restaurantSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) {
      return next();
    }
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });

  restaurantSchema.methods.checkPassword = async function (
    userPassword, // inside form
    restaurantPassword // inside DB
  ) {
    return await bcrypt.compare(userPassword, restaurantPassword);
  };


module.exports = mongoose.model('Restaurant', restaurantSchema);