const express = require('express');
const axios = require('axios');
const OAuth = require('oauth-request')
const crypto = require('crypto')

const router = express.Router();

const config =  {
  twitterHost: 'https://api.twitter.com/1.1',
  twitter:{
      consumerKey: process.env.consumerKey,
      consumerSecret: process.env.consumerSecret,
      accessToken: process.env.accessToken,
      tokenSecret: process.env.tokenSecret,
      bearerToken: process.env.bearerToken
  }
}

let oauth = OAuth({
  consumer: {
      key: config.twitter.consumerKey,
      secret: config.twitter.consumerSecret,
  },
  nonce_length: 11,
  last_ampersand: true,
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
      return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
  },
})

const token = {
  key: config.twitter.accessToken,
  secret: config.twitter.tokenSecret,
}

router.get('/test', function(req, res, next) {
  console.log('q ::: ',req.query.q);
  res.end('success');
});

router.get('/tweets', (req, res, next)=>{
  console.log(req.query.q);
  axios.get(`${config.twitterHost}/search/tweets.json?result_type=recent&q=${encodeURIComponent(req.query.q)}`,
        {
            headers:{
                Authorization: `Bearer ${config.twitter.bearerToken}`,
                Host: 'api.twitter.com'
            }
        }).then(result=>{
          console.log('response ::: ');
            res.json(result.data);
        }).catch(err=>{
          console.log('error ::: ');
          res.json([]);
        });
});

router.get('/users', (req, res, next)=>{
  console.log(req.query.q);
  const url = `${config.twitterHost}/users/search.json?q=${req.query.q}`
  oauth.setToken(token);
  oauth.get(url, function(err, result, tweets) {
      if(err){
        res.json([]);
      }else{
        tweets = JSON.parse(tweets);
        if(tweets && tweets !== null && tweets.length > 0){
            const options = tweets.map(i=>{
                return {
                    name: i.name,
                    screenName: i.screen_name,
                    profileImage: i.profile_image_url_https
                }
            });
            res.json(options);
        }else{
          res.json([]);
        }
      }
  });
});

module.exports = router;
