const User = require('../models/user');
const Complain = require('../models/complain');

module.exports = {
  checkUserSession: async (req, res, next) => {
    try {
      const { email } = req.session;
      if (email) {
        const user = await User.findOne({ email });

        if (user) {
          const { status, code } = user;

          if (status === 'verified') {
            if (code !== 0) {
              return res.redirect('/user-otp');
            } else {
              req.user = user;
              next();
            }
          } else {
            return res.redirect('/report');
          }
        } else {
          return res.redirect('/login');
        }
      } else {
        return res.redirect('/signup');
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      return res.status(500).send('Internal Server Error');
    }
  },

  registerComplain: async (req, res) => {
    const { name, mobile, email, location, locationdescription, date, status } = req.body;
    const wastetype = req.body.wastetype.join(',');
    const file = req.file ? req.file.filename : '';

    const newComplain = {
      name,
      mobile,
      email,
      wasteType: wastetype,
      location,
      locationDescription: locationdescription,
      file,
      date,
      status
    };

    try {
      const complain = await Complain.create(newComplain);
      req.flash('success', 'Complain registered successfully!');
      res.session.complain(complain);
      res.render('complain/success', { msg: 'Complain Registered Successfully!', alertType: 'success' });
    } catch (err) {
      res.render('complain/index', { msg: 'Failed to Register!', alertType: 'warning' });
    }
  }
};
