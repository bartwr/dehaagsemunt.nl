<?php

namespace Roots\Sage\Payments;

class DeMunt_Payments {

  public function __construct() {
    add_filter('admin_post_new_payment', array($this, 'create_payment'), 0);
  }

  /**
   * Create a new request by a registered user. Form handler
   */
  public function create_payment() {

    if ( 'POST' == $_SERVER['REQUEST_METHOD'] && !empty( $_POST['action'] ) &&  $_POST['action'] == 'new_payment') {

      // Check if required values are present
      if (isset($_POST['amount'])) { $amount =  $_POST['amount']; }
        else { return; }

      if (isset($_POST['costs'])) { $costs = $_POST['costs']; }
        else { return; }

      if (isset($_POST['donation'])) { $donation = $_POST['donation']; }
        else { return; }

      // Parse and validate values
      $amount = preg_replace('~[^0-9|^.|(?=2.)]~', '', $amount);
      $amount = round((float)$amount, 2);
      if ($amount<10) { $amount=10; }
      if ($amount>100) { $amount=100; }

      $costs = preg_replace('~[^0-9|^.|(?=2.)]~', '', $costs);
      $costs = round((float)$costs, 2);
      if ($costs<0) { $costs=0; }
      if ($costs>100) { $costs=100; }

      $donation = preg_replace('~[^0-9|^.|(?=2.)]~', '', $donation);
      $donation = round((float)$donation, 2);
      if ($donation<0) { $donation=0; }
      if ($donation>1000) { $donation=1000; }

      // calculate total order costs
      $total = $amount + $costs + $donation;

      // Setup the payment post
      global $current_user;
      get_currentuserinfo();
      $user_id = $current_user->ID;
      $user_name = $current_user->display_name;
      $title = 'Nieuwe inleg van ' . $user_name;
      $new_post = array(
        'post_title'    => $title,
        'post_status'   => 'publish',
        'post_type'     => 'payment'
      );
      //save the new post
      $post_id = wp_insert_post($new_post);

      // Field key is required! not field value...
      update_field('field_581f0c8592df9', $amount, $post_id);   // amount
      update_field('field_581f0cf092dfa', $costs, $post_id);    // costs
      update_field('field_581f0d1392dfb', $donation, $post_id); // donation
      update_field('field_581f0db948437', $user_id, $post_id);  // user
      update_field('field_581f0d4e48434', 'draft', $post_id);   // mollie payment status

      // initialize Mollie payment
      // https://github.com/mollie/mollie-api-php/blob/master/examples/04-ideal-payment.php
      require_once dirname(__FILE__) . "/mollie/src/Mollie/API/Autoloader.php";
      $mollie = new \Mollie_API_Client;
      $mollie->setApiKey("test_UwktHbdFJRMwng5RANPrEguJJnduNm");

      /*
    	 * Determine the url parts to these example files.
    	 */
    	$protocol = isset($_SERVER['HTTPS']) && strcasecmp('off', $_SERVER['HTTPS']) !== 0 ? "https" : "http";
    	$hostname = $_SERVER['HTTP_HOST'];
    	$path     = dirname(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : $_SERVER['PHP_SELF']);
      /*
    	 * Payment parameters:
    	 *   amount        Amount in EUROs. This example creates a € 27.50 payment.
    	 *   method        Payment method "ideal".
    	 *   description   Description of the payment.
    	 *   redirectUrl   Redirect location. The customer will be redirected there after the payment.
    	 *   metadata      Custom metadata that is stored with the payment.
    	 *   issuer        The customer's bank. If empty the customer can select it later.
    	 */
    	$payment = $mollie->payments->create(array(
    		"amount"       => $total,
    		"method"       => \Mollie_API_Object_Method::IDEAL,
    		"description"  => $title,
        "webhookUrl"   => "https://dehaagsemunt.nl/webhooks/mollie",
    		"redirectUrl"  => "https://dehaagsemunt.nl/dashboard/account",
    		"metadata"     => array(
    			"order_id" => $post_id,
          "amount"   => $amount,
          "costs"    => $costs,
          "donation" => $donation
    		),
    		"issuer"       => !empty($_POST["issuer"]) ? $_POST["issuer"] : NULL
    	));

      update_field('field_581f0d8348435', $payment->id, $post_id);            // mollie_id
      update_field('field_581f0d9848436', print_r($payment,true), $post_id);  // mollie_details

      // Redirect to Mollie
      header("Location: " . $payment->getPaymentUrl());
    }
  }

}

new DeMunt_Payments();
