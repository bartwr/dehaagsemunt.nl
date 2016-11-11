<?php

namespace Roots\Sage\Mollie;

use Roots\Sage\Transaction;

// http://coderrr.com/create-an-api-endpoint-in-wordpress/
// https://gist.github.com/pommiegranit/47c639afff4eff8fd9ff#file-webhooks_action-php

class Mollie {

  //use Transaction;

  public function __construct(){
		add_filter('query_vars', array($this, 'add_query_vars'), 0);
		add_action('parse_request', array($this, 'sniff_requests'), 0);
		add_action('init', array($this, 'add_endpoint'), 0);
	}

  public function add_query_vars($vars){
		$vars[] = 'mollie';
		return $vars;
	}

  public function add_endpoint(){
		add_rewrite_rule('^webhooks/mollie','index.php?mollie=1','top');
	}

  public function sniff_requests() {
		global $wp;
    if(isset($wp->query_vars['mollie'])){
			$this->handle_request();
			exit;
		}
	}

  protected function handle_request() {
		global $wp;

    if (empty($_POST) || !isset($_POST['id'])) { return; }

    /*
     * Initialize Mollie
     */
    require_once dirname(__FILE__) . "/mollie/src/Mollie/API/Autoloader.php";
    $mollie = new \Mollie_API_Client;
    $mollie->setApiKey("test_UwktHbdFJRMwng5RANPrEguJJnduNm");

    /*
  	 * Retrieve the payment's current state from mollie.
     */
    $mollie_payment  = $mollie->payments->get($_POST['id']);
    $payment_id = $mollie_payment->metadata->order_id;

    /**
     * Fetch payment from the local database
     */
    $payment = get_post($payment_id);
    if (!$payment->ID) { return; }

    /**
     * Update payment in local database (mollie status and details)
     */
    $payment_post_id = $payment->ID;
    $old_payment_status = get_field('payment_status', $payment_post_id);
    $new_payment_status = $mollie_payment->status;
    update_field('field_581f0d9848436', print_r($mollie_payment,true), $payment_post_id);  // mollie_details
    update_field('field_581f0d4e48434', $new_payment_status, $payment_post_id);        // mollie_status
    $user = get_field('payment_user', $payment_post_id);
    $amount = get_field('payment_amount', $payment_post_id);

    /**
     * Create a new transaction when status is 'paid'
     */
    if ($new_payment_status == 'paid') {
      $new_transaction = array(
        'post_title'    => 'Nieuwe inleg',
        'post_status'   => 'publish',
        'post_type'     => 'transaction'
      );
      $transaction_post_id = wp_insert_post($new_transaction);
    }

    /**
     * Set fields of the new transaction and link to payment
     */
    update_field('field_582242fc482e6', 'P', $transaction_post_id);                     // type
    update_field('field_582242a1482e4', $user, $transaction_post_id);                   // recipient
    update_field('field_5822426c482e3', $amount, $transaction_post_id);                 // amount
    update_field('field_58224dabfe7f2', array($transaction_post_id), $payment_post_id); // Update payment, link to transaction

    /**
     * Trigger the Transaction handler.
     * has to be done manually, not post_save hook since meta-fields are needed and not yet saved at that point
     */
    Transaction\handle_transaction($transaction_post_id);

    // done
	}
}

new Mollie();
