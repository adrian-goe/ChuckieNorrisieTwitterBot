let express = require('express');
let request = require('request');

import { randomNumber, offensiveJoke, filterJoke } from './helpers/helpers';
import { postTweet, postTweetMedia } from './helpers/twitterActions';

let app = express();
app.get('/', function(req, res) {
  res.status(200).json({message:'The twitter bot is working just fine'});
});
app.listen(process.env.PORT || 3000);

let { GOOGLE_API_KEY, CUSTOM_SEARCH_ID } = require ('./config/config.json').GOOGLE;


const URL_GOOGLE_CS = 'https://www.googleapis.com/customsearch/v1';

const SHORTENED_LINK_LENGTH = 23;

function updateTwitter() {
  setInterval(async function() {
    let randomJoke = await getRandomJoke(maxLength);
    postTweet(randomJoke);
  }, (6 * 1000 * 60 * 60));
}

function trackMentions(twitterHandler) {
  let stream = T.stream('statuses/filter', {track:twitterHandler});

  stream.on('tweet', function(tweet) {
    let asker = `@${tweet.user.screen_name}`;
    replyTweetWithJoke(asker);
  });
}

function imageSearch(query) {
  query = query.replace(/ /g, '+');
  let url = `${URL_GOOGLE_CS}?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_ID}&q=${query}&searchType=image&imgColorType=color`;

  return new Promise(function(resolve, reject) {
    request({
      url: url,
      method: 'GET',
    }, function(err, res) {
      if(err) {
        return err;
      }
      let { items } = JSON.parse(res.body);
      resolve(items);
    });
  });
}

async function replyTweetWithJoke(asker) {
  // let images = await imageSearch('Chuck Norris Portrait');
  // let imageLink = images[randomNumber(0, 9)].image.thumbnailLink;
  // let imageLink = images[randomNumber(0, 9)].link;
  let randomJoke = await getRandomJoke(140 - asker.length/* - SHORTENED_LINK_LENGTH*/);
  let tweet = `${asker} ${randomJoke}`;
  // postTweetMedia(tweet, new Buffer(imageLink).toString('base64'));
  postTweet(tweet);
}

/*ACTIONS*/
// replyTweetWithJoke('@UWaseem24');
// trackMentions('@ChuckieNorrisie');
// updateTwitter();
