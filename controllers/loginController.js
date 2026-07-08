const userDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const path = require('path');
const fsPromises = require('fs').promises;

const loginController = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    
    const foundUser = userDB.users.find(person => person.username === user);
    if (!foundUser) return res.sendStatus(401);

    const matchPwd = await bcrypt.compare(pwd, foundUser.password);
    if (!matchPwd) return res.sendStatus(401);

    const roles = Object.values(foundUser.roles);

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
    );

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);

    const currentUser = { ...foundUser, refreshToken };
    userDB.setUsers([...otherUsers, currentUser]);

    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(userDB.users)
    );

    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

    res.json({ accessToken });
}

module.exports = { loginController } // same as authController