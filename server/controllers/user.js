const bcrypt = require('bcryptjs');

const register = (req, res) => {
  const { username, password: pw } = req.body
  const db = req.app.get('db')

  db.user.find_user_by_username(username)
    .then((user) => {
      if (user.username === username) {
        res.status(500).send('Username is taken')
      } else {

        const encPassword = bcrypt.hashSync(pw)
        const profile_pic = `https:robohash.org/${username}.png`
        db.user.create_user(username, encPassword, profile_pic)
          .then(useArr => {
            req.session.user = useArr[0]
            res.status(200).send(useArr[0])
          }).catch((err) => res.status(500).send(`Error: creating user: ${err}`))
      }



    }).catch((err) => res.status(500).send(`Error creating user: ${err}`))

}

const login = async (req, res) => {
  const { username, password } = req.body;
  const db = req.app.get('db');

  try {
    const userArr = await db.user.find_user_by_username(username);
    const user = userArr[0];
    if (user) {
      const credentialMatch = bcrypt.compareSync(password, user.password);
      if (credentialMatch) {
        req.session.user = user;
        res.status(200).send(user);
      } else {
        res.sendStatus(403);
      }
    }
  } catch (e) {
    res.sendStatus(403);
  }

}

const getUser = (req, res) => {
  const user = req.session.user;
  if (user) {
    res.status(200).send(user);
  } else {
    res.sendStatus(404);
  }
}

const logout = (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
}

module.exports = {
  register,
  login,
  getUser,
  logout
};
