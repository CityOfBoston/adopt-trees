<?php
require_once 'google-api-php-client/src/Google_Client.php';
require_once 'google-api-php-client/src/contrib/Google_FusiontablesService.php';
require_once 'Mandrill.php';

function pg_connection_string_from_database_url() {
  extract(parse_url($_ENV["HEROKU_POSTGRESQL_CRIMSON_URL"]));
  return "user=$user password=$pass host=$host dbname=" . substr($path, 1); # <- you may want to add sslmode=require there too
}
function parseInput($value) {
  $value = htmlspecialchars($value, ENT_QUOTES);
  $value = str_replace("\r", "", $value);
  $value = str_replace("\n", "", $value);
  return $value;
}

# Get posted variables
$yourname = parseInput($_POST['yourname']);
$signname = parseInput($_POST['signname']);
$email = parseInput($_POST['email']);
$address = parseInput($_POST['address']);
$treeaddress = str_replace('\'', '\\\'', $_POST['treeaddress']);

$treetype = parseInput($_POST['treetype']);
$latin = str_replace('\'', '\\\'', $_POST['latin']);

$bday = parseInput($_POST['bday']);

# Establish connection
$pg_conn = pg_connect(pg_connection_string_from_database_url());

# Insert into Postgres
$result = pg_query($pg_conn, "INSERT INTO subscriptions (subname, signname, email, address, treeaddress, treetype, bday) VALUES ('$yourname', '$signname', '$email', '$address', '$treeaddress', '$treetype', '$bday')");

if (!$result) {
  die("Error in SQL query: " . pg_last_error());
}
else{
  $url = 'https://www.googleapis.com/fusiontables/v1/query';
  $fields = array(
    'key' => $_ENV['apikey'],
    'sql' => 'SELECT ROWID from ' . $_ENV['tableid'] . ' WHERE Address=\'' . $treeaddress . '\' AND \'Latin Name\'=\'' . $latin . '\''
  );
  //url-ify the data for the POST
  foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
  rtrim($fields_string, '&');
  
  //open connection
  $ch = curl_init();

  //set the url, number of POST vars, POST data
  curl_setopt($ch,CURLOPT_URL, $url);
  curl_setopt($ch,CURLOPT_POST, count($fields));
  curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

  //execute post
  $result = json_decode( curl_exec($ch) );
  $rows = $result->{'rows'};
  $rowid = $rows[0][0];

  //close connection
  curl_close($ch);
  
  session_start();

  $key = file_get_contents('/app/www/privatekey.p12');

  $client = new Google_Client();
  $client->setApplicationName($_ENV["appname"]);
  $client->setClientId($_ENV["clientid"]);
  //$client->setClientSecret($_ENV["clientsecret"]);
  //$client->setRedirectUri('http://adoptatree.herokuapp.com/oauth2callback');
  $client->setAssertionCredentials(new Google_AssertionCredentials(
    $_ENV["email"],
    array("https://www.googleapis.com/auth/fusiontables"),
    $key
  ));
  
  $service = new Google_FusiontablesService($client);
  $updateQuery = "UPDATE " . $_ENV['tableid'] . " SET Adopted=1 WHERE ROWID='" . $rowid . "'";
  $service->query->sql($updateQuery);

  if($rowid != ""){
    $emailapi = $_ENV["emailapi"];

    $mandrill = new Mandrill($emailapi);

    $message = array(
      'subject' => 'You Adopted a Tree!',
      'from_email' => 'info@greenovateboston.org',
      'html' => '<p>Congratulations, you adopted a tree!</p><p>Your tree lives at ' . $treeaddress . '.</p>',
      'to' => array(array('email' => $email, 'name' => $yourname)),
      'merge_vars' => array(array(
          'rcpt' => $email,
          'vars' =>
          array(
              array(
                'name' => 'YOURNAME',
                'content' => $yourname)
          ))));

    $template_name = 'Welcome';

    $template_content = array(
        array(
          'name' => 'main',
          'content' => 'Hi *|YOURNAME|*, thanks for signing up.'),
        array(
          'name' => 'footer',
          'content' => 'Copyright 2012.')

    );

    $mandrill->messages->sendTemplate($template_name, $template_content, $message);
  }
  
  header( 'Location: http://cityofboston.github.io/adopt-trees/adopted.html?address=' . $treeaddress . '&type=' . $treetype . '&latin=' . $latin . '&rowid=' . $rowid );

  exit;
}

?>