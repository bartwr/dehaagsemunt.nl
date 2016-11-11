<?php

namespace Roots\Sage\Transaction;

use Roots\Sage\Balance;

class Transaction {

  public function __construct() {

    $fields = array(
      'transfer_from' => 'field_582242df482e5',
      'transfer_to' => 'field_582242df482e5',
      'transfer_type' => 'field_582242df482e5',
      'transfer_amount' => 'field_582242df482e5'
    );
    add_filter('admin_post_transfer', array($this, 'handle_transfer_form'), 0);
  }


  /***
   *
   * Handle transaction ui-form
   *
   **/
  public function handle_transfer_form() {
    if ( 'POST' == $_SERVER['REQUEST_METHOD'] && !empty( $_POST['action'] ) &&  $_POST['action'] == 'transfer') {

      // validate fields
      if (isset($_POST['amount'])) { $amount =  $_POST['amount']; }
        else { return; }
      if (isset($_POST['to'])) { $to = $_POST['to']; }
        else { return; }
      if (isset($_POST['description'])) { $description = $_POST['description']; }

      $amount = preg_replace('~[^0-9|^.|(?=2.)]~', '', $amount);
      $amount = round((float)$amount, 2);
      if ($amount<0) { $amount=0; }
      if ($amount>100) { $amount=100; }

      $from = get_current_user_id();

      $args = array(
        'post_title'    => "Overschrijving van {$from} naar {$to}",
        'post_status'   => 'publish',
        'post_type'     => 'transaction',
        'post_content'  => $description
      );
      $post_id = wp_insert_post($args);

      /**
       * Set fields of the new transaction and link to payment
       */
      update_field('field_582242fc482e6', 'T', $post_id);                   // type
      update_field('field_582242a1482e4', $to, $post_id);                   // to
      update_field('field_582242df482e5', $from, $post_id);                   // from
      update_field('field_5822426c482e3', $amount, $post_id);               // amount

      /**
       * Trigger the Transaction handler.
       * has to be done manually, not post_save hook since meta-fields are needed and not yet saved at that point
       */
      $this->handle_transaction($post_id);

      // redirect to dashboard
      wp_redirect('/dashboard');
    }
  }


  /***
   *
   * Handle a new transaction: update balances.
   *
   **/
  public function handle_transaction($post_id) {
    // get post;
    $post = get_post($post_id);
    // check post type;
    $post_type = get_post_type($post_id);
    if ( $post_type != 'transaction' ) return;
    // Check for proper publication status (published, not updated)
    if (isset($post->post_status) && ('publish' != $post->post_status) ) return;

    // // get values;
    $fields = array(
      'transaction_type'   => 'field_582242fc482e6',
      'transaction_amount' => 'field_5822426c482e3',
      'transaction_to'     => 'field_582242a1482e4',
      'transaction_from'   => 'field_582242df482e5'
    );
    $amount = get_field('transaction_amount', $post_id);
    $from   = get_field('transaction_from', $post_id);
    $to     = get_field('transaction_to', $post_id);
    $type   = get_field('transaction_type', $post_id);

    $amount_meta = array($amount);

    // Subtract balance for sender if needed.
    if ($type != 'P') {
      $b = Balance\subtract($from, $amount);
      $amount_meta = $b['new'];
    }
    //
    // // Add balaance of receiver.
    // $balance_receiver = Balance\add($to, $amount);
    //
    // // Validate result and send notification to user and ssytem

    $message = 'Handling transaction<br>';
    $message .= "Post id: {$post_id} <br>";
    $message .= "Post type: " . $post_type . "<br>";
    $message .= "Amount: {$amount} <br>";
    $message .= "<pre>";
    $message .= print_r($post,true);
    $message .= print_r($balance_sender, true);
    $message .= "</pre>";

    wp_mail('arn@urbanlink.nl', 'handle_transaction', $message);
  }


  //
  // /*
  //  * Update balance after creating a new transaction.
  //  */
  // function demunt_save_transaction($post_id, $post, $update) {
  //
  //   // // Fetch latest balance for sender
  //   // $args = array (
  //   //   'post_type' => 'balance',
  //   //   'numberposts' => 1,
  //   //   'meta_key'		=> 'balance_account',
  // 	//   'meta_value'	=> $transaction_from_account
  //   // );
  //   // //$balance_sender = get_posts($args);
  //
  //   // $messsage = 'Update balance result: <br>';
  //   $message .= '<pre>';
  //   $message .= "post_id: {$post_id} <br>";
  //   // $message .= 'update: '  . $update  . '<br>';
  //   $message .= 'post: ' . print_r($post, true) . '<br>';
  //   $message  .= "amount: {$amount} <br>";
  //   // $message .= "type: {$transaction_type} <br>";
  //   // $message .= 'to: '     . print_r($transaction_to_account,true) . '<br>';
  //   // $message .= 'from: '   . $transaction_from_account . '<br>';
  //
  //
  //   // $message .= 'balance sender <br>';
  //   // $message .= print_r($balance_sender, true);
  //   $message .= '</pre>';
  //   wp_mail('arn@urbanlink.nl', 'balance update result', $message);
  //
  //   // Calculate new balance for sender
  //
  //   // Save new balance
  //
  //   // Fetch latest balance for receiver
  //
  //   // Calculate new balance for receiver
  //
  //   // Update balance for receiver
  //
  // }
  //
  //add_action( 'save_post', __NAMESPACE__ . '\\handle_transaction');

}

new Transaction();
