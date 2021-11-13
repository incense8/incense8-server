const passport = require("passport");
const joi = require("joi");
module.exports = {
  // first middle wares
  isAuthenticated: (req, res, next) => {
    passport.authenticate("jwt", (err, user) => {
      if (err || !user) {
        res
          .status(403)
          .send({
            err: "you are not a user and not Admin these routes are restricted",
          });
      } else {
        req.user = user;
        next();
      }
    })(req, res, next);
  },
  //second middlew wares
  signup: (req, res, next) => {
    const schema = joi.object({
      fullname: joi.string(),
      Phoneno: joi.string(),
      Study: joi.string(),
      Semaster: joi.string(),
      Email: joi.string().email(),
      password: joi.string(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      switch (error.details[0].context.key) {
        case "fullname":
          return res.status(201).json({ error: "this name" });
          break;
        case "address":
          return res.status(201).json({ error: "that address" });
          break;
        case "Phoneno":
          return res.status(201).json({ error: "this phoneno" });
          break;
        case "Study":
          return res.status(201).json({ error: "this Study" });
          break;
        case "Semaster":
          return res.status(201).json({ error: "this Semaster" });
          break;
        case "Email":
          return res.status(201).json({ error: "this is not a email" });
          break;

        case "password":
          return res.status(201).json({ error: "Password is not safe" });
          break;
        // default:
        //   res.status(201).json({ error: "invalid Registernation" });
        //   break;
      }
    }
    next();
  },
};
