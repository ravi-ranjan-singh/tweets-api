const express = require('express');
const dotenv = require('dotenv');
const twit = require('twit');
const cors = require('cors');

dotenv.config({ path: './config.env' });

const app = express();

app.use(cors());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

let T = new twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
});

app.get('/users', (req, res) => {
  try {
    T.get('users/search', { q: req.query.name }, function (
      err,
      data,
      response
    ) {
      if (!err) {
        let persons = [];

        data.forEach((person) => {
          persons.push({ name: person.name, screen_name: person.screen_name });
        });

        return res.status(200).json({
          msg: 'success',
          persons,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'fail',
      err,
    });
  }
});


app.get('/tweetsbytags/:hashtag', (req, res) => {
  try {
    T.get('search/tweets', { q: req.params.hashtag, count: 200 }, function (
      err,
      data,
      response
    ) {
      if (!err) {
        let tweets = [];

        data.statuses.forEach((tweet) => {
          tweets.push({
            date: tweet.created_at,
            name: tweet.user.name,
            content: tweet.text,
            screen_name: tweet.user.screen_name,
            profile_img: tweet.user.profile_image_url_https,
            retweet_count: tweet.retweet_count,
            favourites_count: tweet.favorite_count,
          });
        });
        return res.status(200).json({
          results: tweets.length,
          msg: 'success',
          tweets,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'fail',
      err,
    });
  }
});

app.get('/tweets/:screenName', (req, res) => {
  try {
    T.get(
      'statuses/user_timeline',
      { screen_name: req.params.screenName, count: 200 },
      function (err, data, response) {
        if (!err) {
          let tweets = [];

          data.forEach((tweet) => {
            if (!tweet.text.startsWith('RT')) {
              tweets.push({
                date: tweet.created_at,
                name: tweet.user.name,
                content: tweet.text,
                screen_name: tweet.user.screen_name,
                profile_img: tweet.user.profile_image_url_https,
                retweet_count: tweet.retweet_count,
                favourites_count: tweet.favorite_count,
              });
            }
          });

          return res.status(200).json({
            results: tweets.length,
            msg: 'success',
            tweets,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'fail',
      err,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
