FROM node:10.15.0

WORKDIR /app

ADD package.json /app/package.json
RUN npm install

ADD . /app

ENV NODE_ENV production
ENV LOG_LEVEL info

ENV PUBLIC_SERVER_URL 'http://foodbox.everfac.com'
ENV PARSE_SERVER_MOUNT '/parse'

ENV APP_NAME 'everfac'

# Use random.org to generate a random string for the APP_ID and MASTER_KEY/READ_ONLY_MASTER_KEY
# Example: https://www.random.org/strings/?num=10&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new

ENV APP_ID 'SvflR3hB7O'
ENV MASTER_KEY 'fxzsUQ0uOk'
ENV READ_ONLY_MASTER_KEY 'Y1VBn7EGo3'

ENV PUSH_ANDROID_SENDER_ID '796203793440'
ENV PUSH_ANDROID_API_KEY 'AIzaSyCKiJOzkqYsG2RziZjifNoQd8dOxeZylGk'
ENV PUSH_IOS_BUNDLE_ID 'com.foodbox.everfac'

ENV MAILGUN_API_KEY 'not_set'
ENV MAILGUN_DOMAIN 'not_set'
ENV MAILGUN_FROM_ADDRESS 'not_set'
ENV MAILGUN_TO_ADDRESS 'not_set'

ENV MAX_REQUEST_SIZE '20mb'
ENV DOKKU_LETSENCRYPT_EMAIL 'not_set'

# Generate an encrypted password for your parse dashboard user
# https://bcrypt-generator.com/
ENV PARSE_DASHBOARD_USER 'fulladmin'
ENV PARSE_DASHBOARD_PASS 'fullaccess'

ENV PARSE_DASHBOARD_USER_READ_ONLY 'admin'
ENV PARSE_DASHBOARD_PASS_READ_ONLY 'readonly'
