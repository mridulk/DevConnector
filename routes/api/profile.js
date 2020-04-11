const express = require('express');
const config = require('config');
const request = require('request');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/user');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
//get/api/profile/me
//get current users profile
//access:private
router.get('/me', auth, async (req, res) => {
  // res.send("Profile Here")
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.jsob(profile);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
// Post api/profile
// create or update user profile
// access :private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is Required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    //Build profile
    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (location) profileFeilds.location = location;
    if (status) profileFeilds.status = status;
    if (skills)
      profileFeilds.skills = skills.split(',').map((skills) => skills.trim());
    if (bio) profileFeilds.bio = bio;

    if (githubusername) profileFeilds.githubusername = githubusername;

    // console.log(profileFeilds.skills)
    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (linkedin) profileFeilds.social.linkedin = linkedin;
    if (instagram) profileFeilds.social.instagram = instagram;

    //console.log(profileFeilds.social.facebook)
    //res.json(profileFeilds)
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      //if profile found update it
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }
      //Create Profile
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);
//@route GET api/profile
//@desc Get all profile
//@access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: 'Server Error' });
  }
});

//@route GET api/profile/user/:user_id
//@desc Get the profile by user id
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'No Profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'No Profile for this user' });
    }
    console.log(err.message);
    res.status(500).json({ Error: 'Server Error' });
  }
});
//@route api/profile
//@desc Delete profile,user and posts
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    const name = req.user.name;
    //@todo :- Remove users posts
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove user

    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: `User Deleted ${name}` });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Error: 'Server Error' });
  }
});
//@route PUT api/profile/experience
//@desc add profile experience
//access private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company name is required').not().isEmpty(),
      check('from', 'From date is Required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Unshift is same as Push Operation
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);
//@route Delete api/profile/experience
//@desc Delete experience from profile
//@access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index of that experience id which is to be removed
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

//@route PUT api/profile/education
//@desc add profile education
//access private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School name is required').not().isEmpty(),
      check('feildofstudy', 'Feildofstudy is required').not().isEmpty(),
      check('from', 'From date is Required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      feildofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      feildofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Unshift is same as Push Operation
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);
//@route Delete api/profile/education
//@desc Delete education from profile
//@access private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index of that experience id which is to be removed
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});
//@route GET api/profile/github/:username
//@desc Get user repos from Github
//@access Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientID'
      )}&client_secret=${config.get('githubSecret')}}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    request(options,(error,response,body)=>{
        if(error)console.log(error);
        if(response.statusCode!==200){
            return res.status(404).json({msg:"No Github Profile Found"})
        }
        res.json(JSON.parse(body))
    })
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});
module.exports = router;
