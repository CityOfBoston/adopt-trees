# Adopt Trees

An app to learn how to care for young trees in your neighborhood.

<img src="https://raw.github.com/CityOfBoston/adopt-trees/gh-pages/screenshot.png"/>

# Technologies used

* Google Maps API
* Google Fusion Tables
* Mandrill from MailChimp
* Bootstrap 2.X
* TinyBox
* GitHub Pages

# Configuring PostgreSQL

* Create a PostgreSQL database on Heroku (free dev version should be fine)

        heroku addons:add heroku-postgresql:dev
        heroku pg:psql OPTIONS
        
        (you will see a name of your database, such as HEROKU_POSTGRESQL_CRIMSON_URL)
        (if you do not see HEROKU_POSTGRESQL_CRIMSON_URL, replace HEROKU_POSTGRESQL_CRIMSON_URL with the actual database in add.php and the following commands)
        
        heroku pg:psql HEROKU_POSTGRESQL_CRIMSON_URL
        
        (paste in the contents of maketable.php to create the table)
        (use \q to quit)
        (if you ever need to start over, run DROP TABLE subscriptions; and then this script again)

# Configuring Mandrill

* In the command line, run:

        heroku addons:add mandrill:sandbox

* Go to the Heroku App Dashboard, view the app, and open up the Mandrill add-on. You will be asked for some information about your service.

* Choose to set up Mandrill with API access, and copy the API key from the bottom of the page.

* Go to https://mandrillapp.com/templates and create a Welcome template (named Welcome)


# Configuring Fusion Tables

* Create a Fusion Table and make it viewable to people with the URL.

* In the <a href="https://code.google.com/apis/console/">Google API Console</a>, create a named app

* Under API Access > Simple API Access, create a new Server Key and enter no IP address restrictions. You will receive an API key.

* Under API Access, create a Client ID which is a Service Account. You will be prompted to download a private key.

* Save the private key as privatekey.p12 and NEVER make it public on your server, on Git, on GitHub, etc.

* Your Service account comes with OAuth2 Client ID, Email address, and Public key fingerprints

* Set environment variables (on Heroku or server)

        apikey=SIMPLE_API_KEY
        appname=APP_NAME
        clientid=CLIENT_ID
        email=EMAIL_ADDRESS
        tableid=FUSION_TABLE_ID
        emailapi=MANDRILL_API_KEY

* Add the custom OAuth2 e-mail as a collaborator with Edit access on your Fusion table

# Homepage

Static pages on <a href="https://github.com/cityofboston/adopt-trees/tree/gh-pages">this repo's gh-pages branch</a> explain the project and display the Fusion Tables map.