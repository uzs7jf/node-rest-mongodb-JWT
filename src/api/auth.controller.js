const config = require("../config/auth.config");
const GamePlayer = require("../models/gameplay.model.js");
const Player = require("../models/player.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  // Create one player
  registerOne: async (req, res) => {
    try {
      const player = new Player({
        playerId: await GamePlayer.find().countDocuments() + 1,
        nickName: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      });
      const res = player.save();
      return res;
    } catch (error) {
      return error;
    }
  },

  signIn: async (req, res) => {
    Player.findOne({
      nickName: req.body.username
    }).exec((err, player) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
  
        if (!player) {
          return res.status(404).send({ message: "player Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          player.password
        );
  
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
  
        var token = jwt.sign({ id: player.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
  
        res.status(200).send({
          id: player._id,
          username: player.username,
          email: player.email,
          accessToken: token
        });
      });
    }
}

