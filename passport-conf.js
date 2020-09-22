const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const dbManager = require('./dbManager');

function init(passport) {
	
	const authenticateUsers = async (email, password, done) => {
		const user = await dbManager.findUser({email},1);
			if (user.users == null) {
				return done(null, false, { message: "No user found." });
			}
			// Wrap async in try catch 
			try {
				const flag = await bcrypt.compare(password, user.users.password);
				if (flag) {
					return done(null, user.users);
				} else {
					return done(null, false, { message: "Wronng password" });
				}
			} catch (e) {
				return done(e);
			}
	};
	passport.use(new localStrategy({ usernameField: 'email' }, authenticateUsers));
	passport.serializeUser((user, done) => {
		// console.log(user);
		done(null , user.id)});
	passport.deserializeUser(async (id, done) => {
		const user = await dbManager.findUser({id}, 1 );
		console.log(id);
		return done(null, user);
	});
}

module.exports = init;