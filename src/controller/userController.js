const { User } = require("../models/UserSchema");
const { Book } = require("../models/Books");
const path = require("path");

const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**____ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.password,
  },
});
function jwtSignUser(user, time) {
  const ONE_WEEK = time;
  return jwt.sign(user, config.JwtSecret, {
    expiresIn: ONE_WEEK,
  });
}
module.exports = {
  async BookSearch(req, res) {
    console.log(req)
    const { user } = req;
    const { _id, Email, fullname, Phoneno, status, Study, Semaster, token } =
      user.userObjjson;
     console.log(req.user.token)
    console.log(req.user);
    try {
      const books = await Book.find({
        BookFor: `${Study}`,
        sem: `${Semaster}`,
      });
      console.log(books);
      return res.send({
        id: _id,
        Email: Email,
        fullname: fullname,
        Phoneno: Phoneno,
        status: status,
        Study: Study,
        Semaster: Semaster,
        books,
        token: req.user.token
      });
     
    } catch (er) {
      console.log(er);
    }
  },

  findById: (req, res) => {
    const { user } = req;
    if (!user) {
      return res.status(400).send({ error: "server is having an issue" });
    }
    return res.json(user);
  },
  /* data fetch functionlity test* */
  /**__________________ */
  async signup(req, res) {
    try {
      const user = await User.create({
        Email: req.body.Email,
        fullname: req.body.fullname,
        Study: req.body.Study,
        Semaster: req.body.Semaster,
        password: req.body.password,
      });
      const userObjjson = await user.toJSON();
      const token = jwtSignUser(userObjjson, 60000);
      const url = `http://${req.headers.host}/api/vi/user/Verify/${token}`;
      transporter
        .sendMail({
          from: "Insecon",
          to: user.Email,
          subject: "Verify Account",
          html: `Click <a href = '${url}'>here</a> to confirm your email. `,
        })
        .catch((err) => {
          console.log(err);
          res
            .status(205)
            .send(" Sever is handling some issue we will contact you soon");
        });
      return res.status(200).json({
        message: "You have been registered Please Verify you Email",
      });
    } catch (error) {
      if(error.code === 11000 ){
        return res.status(201).json({ error: "User already exist" });
      }
     
      console.log(
        "Req.body has some field which  are already exist in  databass and cannot be dupliated"
      );
      return res
        .status(400)
        .json({ error: "somthing is with wrong with data" });
    }
  },

  /*-------------------------------------------- */

  //login functionallity

  async login(req, res, next) {
    try {
      console.log("hellow");
      const { Email, password } = req.body;
      const user = await User.findOne({
        Email,
      });

      if (!user) {
        return res
          .status(404)
          .send({ error: "the login information is worng" });
      }

      const isPasswordValid = await user.verfiyPassword(password);
      if (!isPasswordValid) {
        return res
          .status(404)
          .send({ error: " the login information is worng" });
      }
      if (user.status === "Panding") {
        console.log("verify this");
        return res.status(201).json({
          message: "Please verify  the Email ",
        });
      }
      if (user.status === "Active") {
        const userObjjson = user.toJSON();

        const token = jwtSignUser(userObjjson, "10h");
        req.user = { userObjjson, token };
        console.log(userObjjson);
        next();
      }
      req, res, next;
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  /*-------------------------------------------- */

  //AddBook functionallity

  async AddBook(req, res) {
    try {
      const createbook = await Book.create(req.body);
      const booksCreated = await createbook.toJSON();
      res.status(200).json({
        booksCreated,
      });
    } catch (error) {
      console.log(error);
    }
  },
  async ResendEmailVerification(req, res) {
    try {
      const { Email } = req.body;
      const data = await User.findOne({ Email: `${Email}` });

      if (data) {
        const dataJson = await data.toJSON();
        if (dataJson.status === "Panding") {
          const token = jwtSignUser(dataJson, 300000);
          const url = `http://localhost:8080/api/vi/user/Verify/${token}`;
          transporter.sendMail({
            from: "Insecon",
            to: data.Email,
            subject: "Verify Account",
            html: `Click <a href = '${url}'>here</a> to confirm your email. `,
          });
          res.status(200).json({
            message: "email has been sent",
          });
        } else {
          res.status(200).json({
            Message: " you have been verified already",
          });
        }
      } else {
        res.status(200).json({
          message: " user doesn't exist",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  /*-------------------------------------------- */

  //EmailVerification functionallity

  async EmailVerification(req, res) {
    try {
      const token = req.params.token;
      const data = jwt.verify(token, config.JwtSecret);

      const update = { status: "Active" };
      User.findByIdAndUpdate(data._id, update, function (error, result) {
        if (error) {
          res.status(200).json({
            message: "you will be  notify right not we are faceing issue",
          });
        } else {
          res.sendFile(path.join(__dirname, "../../htmlpages/index.html"));

          console.log("this person has been verifyed");
        }
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.log("Expired token");
        res.status(205).send({
          message: " this link is no longer Valid plesae try again",
        });
      }
    }
  },
  /*-------------------------------------------- */

  //Password Reset setup functionallity

  async Resetpassword(req, res) {
    try {
      const { password } = req.body;
      const filter = {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      };
      const update = {
        password: password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      };
      const user = User.findOneAndUpdate(
        filter,
        update,
        function (error, result) {
          if (error) {
            res.status(200).json({
              message:
                "you wiill be notifiy right now we are facing some issue",
            });
          }
          transporter.sendMail({
            from: process.env.Email,
            to: result.Email,
            subject: "change Password",
            text:
              "Hello,\n\n" +
              "This is a confirmation that the password for your account " +
              user.email +
              " has just been changed.\n",
          });

          res.status(200).json({
            message: "your password has been updated",
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  } /*-------------------------------------------- */,

  //forgetPassword Request functionallity

  async forgetpasswordReq(req, res) {
    try {
      const { Email } = req.body;
      const user = await User.findOne({ Email }).select("Email");
      if (!user) {
        return res.status(205).send({ error: "No user With this Email" });
      }

      const data = await user.toJSON();

      const token = jwtSignUser(data, 300000);
      const update = {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 300000,
      };
      User.findOneAndUpdate(
        { _id: user._id },
        update,
        function (error, result) {
          if (error) {
            return res.status(200).json({
              message: "please wait  we are facing some issue",
            });
          } else {
            transporter
              .sendMail({
                from: "Insecon",
                to: data.Email,
                subject: "Forget password",
                text:
                  "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                  "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                  "http://" +
                  req.headers.host +
                  "/api/vi/user/reset/" +
                  token +
                  "\n\n" +
                  "If you did not request this, please ignore this email and your password will remain unchanged.\n" +
                  "This link is valid for only 5 min & one time use only",
              })
              .catch((err) => {
                console.log(err);
              });
            res.status(200).json({ message: "you check your email" });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
  /*-------------------------------------------- */

  //changing the password functionallity

  async Resetpasswordcreate(req, res) {
    const user = User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      function (err, user) {
        if (!user) {
          return res
            .status(200)
            .json({ message: "this link is not valide or has been expired" });
        }
        res.sendFile(path.join(__dirname, "../../htmlpages/Forget.html"));
      }
    );
  },
};
