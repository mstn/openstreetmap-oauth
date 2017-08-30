import { parseString } from 'xml2js';

export const OpenStreetMap = {};

const parseStringSync = Meteor.wrapAsync(parseString);

const urls = {
  requestToken: "https://www.openstreetmap.org/oauth/request_token",
  authorize: "https://www.openstreetmap.org/oauth/authorize",
  accessToken: "https://www.openstreetmap.org/oauth/access_token",
  authenticate: function (oauthBinding, params) {
    return OAuth._queryParamsWithAuthTokenUrl(
      "https://www.openstreetmap.org/oauth/authorize",
      oauthBinding,
      params,
    );
  },
  identity: 'https://www.openstreetmap.org/api/0.6/user/details'
};

OAuth.registerService('openstreetmap', 1, urls, function(oauthBinding) {
  const xml = parseStringSync(
    oauthBinding.get(urls.identity).content
  );
  const identity = xml.osm.user[0]; 
  const serviceData = {
    id: identity.$.id,
    screenName: identity.$.display_name,
    accessToken: OAuth.sealSecret(oauthBinding.accessToken),
    accessTokenSecret: OAuth.sealSecret(oauthBinding.accessTokenSecret)
  };

  return {
    serviceData: serviceData,
    options: {
      profile: {
        username: identity.$.display_name,
        picture: (identity.img && identity.img[0]) ? identity.img[0].$.href : '',
        home: (identity.home && identity.home[0]) ? identity.home[0].$ : null,
        description: identity.description[0],
        languages: identity.languages.length && identity.languages[0].lang,
        accountCreatedAt: identity.$.account_created
      }
    }
  };
});

OpenStreetMap.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
