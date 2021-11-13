const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { string } = require("joi");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    Phoneno: {
      type: Number,
      require: true,
      trim: true,
    },
    Study: {
      type: String,
      require: true,
      trim: true,
    },
    Semaster: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      default: "Panding",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },

  {
    //this is for undataing the username and passowrd
    timestamps: true,
  }
);

//pre-method it is method which run before you save or save
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPass = await bcrypt.hash(this.password, 10);
    return (this.password = hashedPass);
  } catch (error) {
    return next(error);
  }
});

//update one   will be use for updateing a passowrd and hashing it

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    if (this._update.password) {
      const hashedPass = await bcrypt.hash(this._update.password, 10);
      this._update.password = hashedPass;
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.verfiyPassword = async function (plain_password) {
  return bcrypt.compare(plain_password, this.password);
};

// /_______________________________________________/

const User = mongoose.model("users", userSchema);
module.exports = { User };
