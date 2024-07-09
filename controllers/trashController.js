const User = require('../models/user')
const Complain = require('../models/complain')

module.exports = {
  checkUserSession: async (req, res, next) => {
    const { email, password } = req.session;
    if (email && password) {
      await connectToDB();
      const user = await User.findOne({ email });
      if (user) {
        const { status, code } = user;
        if (status === 'verified') {
          if (code != 0) {
            return res.redirect('../reset-code');
          }
        } else {
          return res.redirect('../user-otp');
        }
        req.user = user;
        next();
      } else {
        return res.redirect('../login-user');
      }
    } else {
      return res.redirect('../login-user');
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
      res.render('trash', { msg: 'Complain Registered Successfully!', alertType: 'success' });
    } catch (err) {
      res.render('trash', { msg: 'Failed to Register!', alertType: 'warning' });
    }

    // Send email notification (adjust the email settings as per your project)
    // ...
  }
};
